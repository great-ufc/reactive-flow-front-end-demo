import type { CartItem, CartRepository } from './pattern';
import { DISCONTINUED_PRODUCT_ID, findProduct } from './catalogue';
import type { Trace } from './trace';

// Changed by the Controls panel while the page runs.
export const serverSettings = {
  latencyMs: 900,
  failNextRequest: false,
};

// Plays the external service that sits behind the adapter. It records
// messages 6 and 7, the request and the response.
export class InMemoryCartServer implements CartRepository {
  private addedCount = 0;

  constructor(
    private readonly trace: Trace,
    private readonly onForcedFailureUsed: () => void,
  ) {}

  async addItem(productId: string): Promise<CartItem> {
    this.trace.record(6);
    const forcedFailure = this.takeForcedFailure();
    await wait(serverSettings.latencyMs);
    this.trace.record(7);

    if (productId === DISCONTINUED_PRODUCT_ID) {
      throw new Error('Discontinued lamp is no longer available.');
    }
    if (forcedFailure) {
      throw new Error('The server rejected this request. Try again.');
    }

    const product = findProduct(productId);
    if (!product) {
      throw new Error(`Unknown product: ${productId}`);
    }

    // A new id for every addition lets the same product enter the cart twice.
    this.addedCount += 1;
    return { id: `${productId}-${this.addedCount}`, name: product.name };
  }

  // A forced failure applies to one request only.
  private takeForcedFailure(): boolean {
    if (!serverSettings.failNextRequest) {
      return false;
    }
    serverSettings.failNextRequest = false;
    this.onForcedFailureUsed();
    return true;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
