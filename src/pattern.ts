// The four listings of the paper Reactive Flow Front-End, in the order they appear there.
// The paper's interface calls render without defining it, so the page supplies it through setRender.

let render: (state: CartState) => void = () => {};

export function setRender(fn: (state: CartState) => void): void {
  render = fn;
}

// Domain model: the cart and the rules that apply to it
interface CartItem { id: string; name: string; }
interface Cart { items: CartItem[]; }
function addItem(cart: Cart, item: CartItem): Cart {
  return { items: [...cart.items, item] };
}
// Immutable application state: domain model plus flow status
interface CartState {
  cart: Cart;
  status: 'idle' | 'loading' | 'error';
}
// Descriptive events emitted by the interface
type CartEvent =
  | { type: 'ADD_ITEM_REQUESTED'; productId: string }
  | { type: 'ADD_ITEM_SUCCEEDED'; item: CartItem }
  | { type: 'ADD_ITEM_FAILED'; reason: string };
// Pure reduction: (state, event) => new state
function cartReducer(state: CartState, event: CartEvent): CartState {
  switch (event.type) {
    case 'ADD_ITEM_REQUESTED':
      return { ...state, status: 'loading' };
    case 'ADD_ITEM_SUCCEEDED':
      return { cart: addItem(state.cart, event.item), status: 'idle' };
    case 'ADD_ITEM_FAILED':
      return { ...state, status: 'error' };
  }
}
// Store that holds the state and notifies observers
class CartStore {
  private state: CartState = { cart: { items: [] }, status: 'idle' };
  private listeners = new Set<(s: CartState) => void>();
  getState(): CartState {
    return this.state;
  }
  subscribe(listener: (s: CartState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  apply(event: CartEvent): void {
    this.state = cartReducer(this.state, event);
    this.listeners.forEach((notify) => notify(this.state));
  }
}

// Contract that isolates the application from network details
interface CartRepository {
  addItem(productId: string): Promise<CartItem>;
}
// Concrete implementation over an HTTP API
class HttpCartRepository implements CartRepository {
  async addItem(productId: string): Promise<CartItem> {
    const response = await fetch('/api/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
    if (!response.ok) throw new Error('Failed to add item');
    return (await response.json()) as CartItem;
  }
}

// Orchestrates: interprets the event and coordinates state and infrastructure
class FlowOrchestrator {
  constructor(
    private readonly store: CartStore,
    private readonly repo: CartRepository,
  ) {}
  async dispatch(event: CartEvent): Promise<void> {
    this.store.apply(event);
    if (event.type === 'ADD_ITEM_REQUESTED') {
      try {
        const item = await this.repo.addItem(event.productId);
        this.store.apply({ type: 'ADD_ITEM_SUCCEEDED', item });
      } catch (error) {
        const reason = String(error);
        this.store.apply({ type: 'ADD_ITEM_FAILED', reason });
      }
    }
  }
}

// The interface only emits events and observes the state
function createCartButton(store: CartStore, flow: FlowOrchestrator) {
  // Reacts to each new state, without querying the store actively
  store.subscribe((state) => render(state));
  // Translates the user's intention into a descriptive event
  function onAddClick(productId: string): void {
    flow.dispatch({ type: 'ADD_ITEM_REQUESTED', productId });
  }
  return { onAddClick };
}

export { addItem, cartReducer, CartStore, HttpCartRepository, FlowOrchestrator, createCartButton };
export type { CartItem, Cart, CartState, CartEvent, CartRepository };
