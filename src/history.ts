import { cartReducer } from './pattern';
import type { CartEvent, CartState } from './pattern';

// The same initial state that the paper's CartStore starts from.
export const initialState: CartState = { cart: { items: [] }, status: 'idle' };

// Every event the orchestrator applied, in order. Any state the page has shown
// can be rebuilt from a prefix of this list, which is the traceability the
// paper claims for the pattern.
export class EventHistory {
  readonly events: CartEvent[] = [];

  add(event: CartEvent): void {
    this.events.push(event);
  }

  // Applies the paper's reducer to the first `count` events.
  rebuild(count: number): CartState {
    return this.events.slice(0, count).reduce(cartReducer, initialState);
  }

  // The paper's CartState records that an operation failed, not why. The
  // reason travels in the ADD_ITEM_FAILED event.
  lastFailureReason(): string {
    const last = this.events[this.events.length - 1];
    return last?.type === 'ADD_ITEM_FAILED' ? last.reason : '';
  }
}
