import {
  CartStore, FlowOrchestrator, HttpCartRepository, createCartButton, setRender,
  type CartItem, type CartRepository, type CartState,
} from './pattern';

class InMemoryCartRepository implements CartRepository {
  async addItem(productId: string): Promise<CartItem> {
    await new Promise<void>((resolve) => window.setTimeout(resolve, 600));
    if (productId === 'broken') throw new Error('This product cannot be added');
    return { id: productId, name: 'Demo product' };
  }
}

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('Missing #app element');
const root = app;
const store = new CartStore();
const repository: CartRepository = new URLSearchParams(window.location.search).has('http')
  ? new HttpCartRepository()
  : new InMemoryCartRepository();
const flow = new FlowOrchestrator(store, repository);
const cartButton = createCartButton(store, flow);

function renderCart(state: CartState): void {
  const title = document.createElement('h1');
  title.textContent = 'Reactive Flow Front-End';
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  status.textContent = `Status: ${state.status}`;
  if (state.status === 'error') status.textContent += '. Failed to add product. Try again.';
  const items = document.createElement('ul');
  for (const item of state.cart.items) {
    const row = document.createElement('li');
    row.textContent = `${item.name} (${item.id})`;
    items.append(row);
  }
  if (state.cart.items.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'Your cart is empty.';
    items.append(empty);
  }
  const add = document.createElement('button');
  add.textContent = 'Add product';
  add.disabled = state.status === 'loading';
  add.onclick = () => cartButton.onAddClick('product');
  const broken = document.createElement('button');
  broken.textContent = 'Add broken product';
  broken.disabled = state.status === 'loading';
  broken.onclick = () => cartButton.onAddClick('broken');
  root.replaceChildren(title, status, items, add, broken);
}

setRender(renderCart);
// The paper's subscription does not emit an initial state.
renderCart(store.getState());
