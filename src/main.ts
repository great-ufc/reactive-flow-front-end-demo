import { createCartButton, setRender } from './pattern';
import { instrument, initialState } from './instrumented';
import { Trace } from './trace';
import { createViews } from './views';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app element');
const trace = new Trace();
const views = createViews(root, trace);
const { store, flow, http } = instrument(trace, views.record, views.disarm);
setRender(state => { trace.emit(11); views.render(state); });
const button = createCartButton(store, flow);
views.bindAdd(button.onAddClick);
views.serverMode(http);
// The paper's subscription does not send an initial notification.
views.render(initialState());
