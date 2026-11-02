import { createCartButton, setRender } from './pattern';
import { EventHistory } from './history';
import { createTracedPattern, TracedHttpServer } from './instrumentation';
import { ArchitecturePanel } from './panels/architecture-panel';
import { ControlsPanel } from './panels/controls-panel';
import { ShopPanel } from './panels/shop-panel';
import { StatePanel } from './panels/state-panel';
import { TracePanel } from './panels/trace-panel';
import { InMemoryCartServer } from './server';
import { Trace } from './trace';

const trace = new Trace();
const history = new EventHistory();

const controls = new ControlsPanel();
const statePanel = new StatePanel(history);
new TracePanel(trace);
new ArchitecturePanel(trace, controls.animationSpeed);

// Add ?http to the address to send requests to a real backend.
const usesHttp = new URLSearchParams(window.location.search).has('http');
controls.showServerMode(usesHttp);
const server = usesHttp
  ? new TracedHttpServer(trace)
  : new InMemoryCartServer(trace, controls.uncheckFailNext);

const { store, flow } = createTracedPattern(trace, server, (event) => {
  history.add(event);
  statePanel.addEvent(event);
});

const shop = new ShopPanel((product) => {
  trace.beginAction(product.name);
  cartButton.onAddClick(product.id);
});

// The paper's interface calls render on every state it observes.
setRender((state) => {
  trace.record(11);
  shop.show(state, history.lastFailureReason());
  statePanel.showLive(state);
});

const cartButton = createCartButton(store, flow);

// The paper's store does not notify a new subscriber, so the first state is
// drawn here.
shop.show(store.getState(), '');
statePanel.showLive(store.getState());
