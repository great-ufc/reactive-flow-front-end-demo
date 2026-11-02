import { CartStore, FlowOrchestrator, HttpCartRepository } from './pattern';
import type { CartEvent, CartItem, CartRepository } from './pattern';
import type { Trace } from './trace';

// The wrappers in this file record the paper's messages without changing the
// paper's code. Each one runs the original behaviour and adds a trace entry
// around it.

// Messages 5 and 8: the orchestrator calls the adapter, and the adapter answers.
class TracedRepository implements CartRepository {
  constructor(
    private readonly inner: CartRepository,
    private readonly trace: Trace,
  ) {}

  async addItem(productId: string): Promise<CartItem> {
    this.trace.record(5);
    try {
      return await this.inner.addItem(productId);
    } finally {
      this.trace.record(8);
    }
  }
}

// In HTTP mode the server is outside the page, so messages 6 and 7 are
// recorded around the paper's own HttpCartRepository.
export class TracedHttpServer implements CartRepository {
  private readonly http = new HttpCartRepository();

  constructor(private readonly trace: Trace) {}

  async addItem(productId: string): Promise<CartItem> {
    this.trace.record(6);
    try {
      return await this.http.addItem(productId);
    } finally {
      this.trace.record(7);
    }
  }
}

// Messages 3 and 9: the orchestrator applies an event to the State Modules.
function traceAppliedEvents(
  store: CartStore,
  trace: Trace,
  onEvent: (event: CartEvent) => void,
): void {
  const originalApply = store.apply.bind(store);

  store.apply = (event) => {
    trace.record(event.type === 'ADD_ITEM_REQUESTED' ? 3 : 9);
    onEvent(event);
    originalApply(event);
  };
}

// Messages 4 and 10: the State Modules notify their observers. This
// subscription is made before the interface's, so it runs first.
function traceNotifications(store: CartStore, trace: Trace): void {
  store.subscribe((state) => {
    trace.record(state.status === 'loading' ? 4 : 10);
  });
}

// Message 2: the interface dispatches its event to the orchestrator.
function traceDispatch(flow: FlowOrchestrator, trace: Trace): void {
  const originalDispatch = flow.dispatch.bind(flow);

  flow.dispatch = (event) => {
    trace.record(2);
    return originalDispatch(event);
  };
}

// Builds the paper's store and orchestrator with every message traced.
export function createTracedPattern(
  trace: Trace,
  server: CartRepository,
  onEvent: (event: CartEvent) => void,
): { store: CartStore; flow: FlowOrchestrator } {
  const store = new CartStore();
  traceAppliedEvents(store, trace, onEvent);
  traceNotifications(store, trace);

  const flow = new FlowOrchestrator(store, new TracedRepository(server, trace));
  traceDispatch(flow, trace);

  return { store, flow };
}
