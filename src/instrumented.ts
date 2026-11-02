import { CartStore, FlowOrchestrator, HttpCartRepository, type CartEvent, type CartItem, type CartRepository } from './pattern';
import { Trace } from './trace';
export const products = [
  { id: 'notebook', name: 'Everyday notebook', price: 12 },
  { id: 'cup', name: 'Ceramic cup', price: 18 },
  { id: 'bag', name: 'Canvas bag', price: 24 },
  { id: 'lamp', name: 'Discontinued lamp', price: 45 },
];
export const settings = { latency: 900, failNext: false };
export const initialState = () => ({ cart: { items: [] as CartItem[] }, status: 'idle' as const });
export class InMemoryCartRepository implements CartRepository {
  private sequence = 0;
  constructor(private trace: Trace, private onDisarm: () => void) {}
  async addItem(productId: string): Promise<CartItem> {
    this.trace.emit(6);
    const fail = settings.failNext;
    settings.failNext = false;
    this.onDisarm();
    await new Promise<void>(resolve => window.setTimeout(resolve, settings.latency));
    this.trace.emit(7);
    if (productId === 'lamp') throw new Error('Discontinued lamp is no longer available.');
    if (fail) throw new Error('The server rejected this request. Try again.');
    const product = products.find(product => product.id === productId);
    if (!product) throw new Error('Unknown product');
    return { id: `${productId}-${++this.sequence}`, name: product.name };
  }
}
class TracingRepository implements CartRepository {
  constructor(private inner: CartRepository, private trace: Trace) {}
  async addItem(productId: string): Promise<CartItem> {
    this.trace.emit(5);
    try { return await this.inner.addItem(productId); }
    finally { this.trace.emit(8); }
  }
}
// HTTP keeps the paper's adapter intact while exposing its request boundary.
class HttpBoundary implements CartRepository {
  constructor(private trace: Trace) {}
  async addItem(productId: string): Promise<CartItem> {
    this.trace.emit(6);
    try { return await new HttpCartRepository().addItem(productId); }
    finally { this.trace.emit(7); }
  }
}
export function instrument(trace: Trace, record: (event: CartEvent) => void, onDisarm: () => void) {
  const store = new CartStore();
  const originalApply = store.apply.bind(store);
  store.apply = event => { trace.emit(event.type === 'ADD_ITEM_REQUESTED' ? 3 : 9); record(event); originalApply(event); };
  store.subscribe(state => trace.emit(state.status === 'loading' ? 4 : 10));
  const http = new URLSearchParams(location.search).has('http');
  const repo = http ? new HttpBoundary(trace) : new InMemoryCartRepository(trace, onDisarm);
  const flow = new FlowOrchestrator(store, new TracingRepository(repo, trace));
  const originalDispatch = flow.dispatch.bind(flow);
  flow.dispatch = event => { trace.emit(2); return originalDispatch(event); };
  return { store, flow, http };
}
