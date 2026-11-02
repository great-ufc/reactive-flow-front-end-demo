import type { CartState } from '../pattern';
import { formatMoney, priceOf, products, type Product } from '../catalogue';
import { byId, createElement } from '../dom';

// The Reactive Interface as the visitor sees it. It only reports clicks and
// draws the states it is given; it never reads the store on its own.
export class ShopPanel {
  private readonly addButtons: HTMLButtonElement[] = [];
  private readonly cartItems = byId<HTMLUListElement>('cart-items');
  private readonly cartTotal = byId('cart-total');
  private readonly statusBadge = byId('flow-status-badge');

  constructor(onAdd: (product: Product) => void) {
    const catalogue = byId('catalogue');

    for (const product of products) {
      catalogue.append(this.createProductRow(product, onAdd));
    }
  }

  show(state: CartState, failureReason: string): void {
    const loading = state.status === 'loading';
    for (const button of this.addButtons) {
      button.disabled = loading;
    }

    this.showCart(state);
    this.showStatus(state, failureReason);
  }

  private createProductRow(product: Product, onAdd: (product: Product) => void): HTMLElement {
    const row = createElement('div', { className: 'product' });
    const name = createElement('span', { text: product.name });
    const price = createElement('span', { className: 'price', text: formatMoney(product.price) });

    const addButton = createElement('button', { text: 'Add' });
    addButton.type = 'button';
    addButton.setAttribute('aria-label', `Add ${product.name}`);
    addButton.addEventListener('click', () => onAdd(product));
    this.addButtons.push(addButton);

    row.append(name, price, addButton);
    return row;
  }

  private showCart(state: CartState): void {
    const items = state.cart.items;
    this.cartItems.replaceChildren();

    if (items.length === 0) {
      this.cartItems.append(createElement('li', { className: 'muted', text: 'Your cart is empty.' }));
    }

    let total = 0;
    for (const item of items) {
      const price = priceOf(item.name);
      total += price;
      this.cartItems.append(createElement('li', { text: `${item.name}, ${formatMoney(price)}` }));
    }

    this.cartTotal.textContent = `Total ${formatMoney(total)}`;
  }

  private showStatus(state: CartState, failureReason: string): void {
    this.statusBadge.className = `status-badge status-${state.status}`;
    this.statusBadge.textContent =
      state.status === 'error' ? `error: ${failureReason}` : state.status;
  }
}
