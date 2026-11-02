export interface Product {
  id: string;
  name: string;
  price: number;
}

// The lamp always fails on the server, so the error path can be seen.
export const DISCONTINUED_PRODUCT_ID = 'lamp';

export const products: Product[] = [
  { id: 'notebook', name: 'Everyday notebook', price: 12 },
  { id: 'cup', name: 'Ceramic cup', price: 18 },
  { id: 'bag', name: 'Canvas bag', price: 24 },
  { id: DISCONTINUED_PRODUCT_ID, name: 'Discontinued lamp', price: 45 },
];

export function findProduct(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

// The paper's CartItem has only an id and a name, so the price is looked up
// in the catalogue by name.
export function priceOf(itemName: string): number {
  return products.find((product) => product.name === itemName)?.price ?? 0;
}

const dollars = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatMoney(amount: number): string {
  return dollars.format(amount);
}
