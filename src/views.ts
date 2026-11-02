import { cartReducer, type CartEvent, type CartState } from './pattern';
import { initialState, products, settings } from './instrumented';
import { messages, roles, Trace } from './trace';
import { architecture } from './architecture';
export function createViews(root: HTMLElement, trace: Trace) {
  root.innerHTML = `<header><p class="eyebrow">PLoP 2026 · Pattern showcase</p><h1>Reactive Flow Front-End</h1><p>Follow an intention through events, state and services.</p></header>
  <main><section class="panel shop"><h2>Shop <span class="role-tag ui">Reactive Interface</span></h2><div id="catalogue"></div><h3>Your cart</h3><div id="cart"></div><p id="status" role="status" aria-live="polite"></p></section>
  <section class="panel architecture"><h2>Architecture</h2><p class="muted">Watch each message cross a role boundary.</p><div id="architecture"></div></section>
  <section class="panel state"><h2>State <span class="role-tag state">State Modules</span></h2><p id="state-mode" aria-live="polite">Live state</p><button id="live" hidden>Back to live</button><h3>Domain model</h3><pre id="domain"></pre><h3>Flow status</h3><pre id="flow-status"></pre><h3>Event history</h3><p class="muted">Select an event to rebuild the state at that point.</p><ol id="events"><li class="empty">No events yet.</li></ol></section>
  <section class="panel controls"><h2>Controls</h2><label for="latency">Server latency <output id="latency-value">900 ms</output></label><input id="latency" type="range" min="0" max="3000" step="100" value="900"><label class="check"><input id="fail" type="checkbox"> Fail the next request</label><label for="speed">Animation speed</label><select id="speed"><option value="slow">Slow</option><option value="normal" selected>Normal</option><option value="fast">Fast</option><option value="instant">Instant</option></select><p id="server-mode" class="muted"></p><div class="legend"><p>→ Solid arrow: call or event</p><p>↑ Upward arrow: state notification</p><p>⇢ Dashed arrow: reply</p></div></section>
  <section class="panel trace"><div class="panel-heading"><h2>Message trace</h2><button id="clear">Clear</button></div><p class="muted">Times are relative to each action. Loading also triggers a re-render (11).</p><div id="trace"><p class="empty">No messages yet.</p></div></section></main><footer>The paper's four TypeScript listings run unchanged. Prices belong to the catalogue; CartState stays as defined in the paper.</footer>`;
  const get = <T extends HTMLElement = HTMLElement>(id: string) => root.querySelector<T>(`#${id}`)!;
  const fail = get<HTMLInputElement>('fail');
  const latency = get<HTMLInputElement>('latency');
  latency.oninput = () => { settings.latency = Number(latency.value); get('latency-value').textContent = `${latency.value} ms`; };
  fail.onchange = () => { settings.failNext = fail.checked; };
  architecture(get('architecture'), trace, get<HTMLSelectElement>('speed'));
  let cycleList: HTMLOListElement | undefined;
  let cycle = -1;
  get('clear').onclick = () => { get('trace').replaceChildren(); cycle = -1; };
  trace.subscribe(message => {
    if (cycle !== message.cycle) {
      get('trace').querySelector('.empty')?.remove();
      const group = document.createElement('details'); group.open = true;
      const heading = document.createElement('summary'); heading.textContent = `Action ${message.cycle} · ${message.title}`;
      cycleList = document.createElement('ol'); group.append(heading, cycleList); get('trace').append(group); cycle = message.cycle;
    }
    const [from, to, label] = messages[message.number];
    const row = document.createElement('li');
    row.innerHTML = `<span class="message-number">${message.number}</span><span class="time">+${message.time} ms</span><span><span class="chip ${from}"></span>${roles[from]} → <span class="chip ${to}"></span>${roles[to]}<strong>${label}</strong></span>`;
    cycleList!.append(row);
  });
  const events: CartEvent[] = [];
  let liveState: CartState = initialState();
  let previous: CartState = initialState();
  let selected: number | null = null;
  let reason = '';
  function showState(state: CartState, before: CartState): void {
    get('domain').textContent = JSON.stringify(state.cart, null, 2);
    get('flow-status').textContent = JSON.stringify({ status: state.status }, null, 2);
    get('domain').classList.toggle('changed', JSON.stringify(state.cart) !== JSON.stringify(before.cart));
    get('flow-status').classList.toggle('changed', state.status !== before.status);
  }
  function selectEvent(index: number): void {
    selected = index;
    const rebuilt = events.slice(0, index + 1).reduce(cartReducer, initialState() as CartState);
    const before = events.slice(0, index).reduce(cartReducer, initialState() as CartState);
    showState(rebuilt, before);
    get('state-mode').textContent = `State rebuilt from events 1..${index + 1}`;
    get('live').hidden = false;
    get('events').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  }
  get('live').onclick = () => {
    selected = null; showState(liveState, previous); get('state-mode').textContent = 'Live state'; get('live').hidden = true;
    get('events').querySelectorAll('button').forEach(button => button.setAttribute('aria-pressed', 'false'));
  };
  function record(event: CartEvent): void {
    events.push(event);
    reason = event.type === 'ADD_ITEM_FAILED' ? event.reason : '';
    get('events').querySelector('.empty')?.remove();
    const li = document.createElement('li'); const button = document.createElement('button');
    const index = events.length - 1;
    button.textContent = `${index + 1} ${event.type}`; button.setAttribute('aria-pressed', 'false');
    button.onclick = () => selectEvent(index);
    const payload = document.createElement('pre'); payload.textContent = JSON.stringify(event, null, 2);
    li.append(button, payload); get('events').append(li);
  }
  function render(state: CartState): void {
    previous = liveState; liveState = state;
    get('catalogue').querySelectorAll<HTMLButtonElement>('button').forEach(button => { button.disabled = state.status === 'loading'; });
    const cart = get('cart'); cart.replaceChildren();
    const list = document.createElement('ul');
    let total = 0;
    for (const item of state.cart.items) {
      const price = products.find(product => product.name === item.name)?.price;
      total += price ?? 0;
      const li = document.createElement('li'); li.textContent = `${item.name} · ${price === undefined ? 'Price unavailable' : money(price)}`; list.append(li);
    }
    if (!state.cart.items.length) { const li = document.createElement('li'); li.textContent = 'Your cart is empty.'; list.append(li); }
    const sum = document.createElement('p'); sum.className = 'total'; sum.textContent = `Total ${money(total)}${state.cart.items.some(item => !products.some(product => product.name === item.name)) ? ' (known prices only)' : ''}`;
    cart.append(list, sum);
    get('status').className = `status ${state.status}`;
    get('status').textContent = `${state.status}${state.status === 'error' ? ` · ${reason}` : ''}`;
    if (selected === null) showState(state, previous);
  }
  function bindAdd(add: (id: string) => void): void {
    for (const product of products) {
      const row = document.createElement('div'); row.className = 'product';
      const name = document.createElement('span'); name.textContent = product.name;
      const price = document.createElement('span'); price.className = 'price'; price.textContent = money(product.price);
      const button = document.createElement('button'); button.textContent = 'Add'; button.setAttribute('aria-label', `Add ${product.name}`);
      button.onclick = () => { trace.begin(product.name); add(product.id); };
      row.append(name, price, button); get('catalogue').append(row);
    }
  }
  return { record, render, bindAdd, disarm: () => { fail.checked = false; }, serverMode: (http: boolean) => {
    get('server-mode').textContent = http ? 'HTTP mode: uses POST /api/cart/items. Server controls latency and failures.' : 'In-memory server: latency and failure controls apply to the next request.';
    latency.disabled = http; fail.disabled = http;
  } };
}
function money(amount: number): string { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount); }
