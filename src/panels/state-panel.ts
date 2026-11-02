import type { CartEvent, CartState } from '../pattern';
import { byId, createElement } from '../dom';
import { initialState, type EventHistory } from '../history';

// Shows the State Modules, with the domain model and the flow status apart,
// and the list of applied events. Selecting an event shows the state rebuilt
// from the events up to it, instead of the live state.
export class StatePanel {
  private readonly domainModel = byId('domain-model');
  private readonly flowStatus = byId('flow-status');
  private readonly source = byId('state-source');
  private readonly backToLiveButton = byId<HTMLButtonElement>('back-to-live');
  private readonly eventList = byId<HTMLOListElement>('event-history');
  private readonly emptyNote = byId('event-history-empty');
  private readonly eventButtons: HTMLButtonElement[] = [];

  private liveState: CartState = initialState;
  private previousLiveState: CartState = initialState;
  private selectedCount: number | null = null;

  constructor(private readonly history: EventHistory) {
    this.backToLiveButton.addEventListener('click', () => this.backToLive());
  }

  showLive(state: CartState): void {
    this.previousLiveState = this.liveState;
    this.liveState = state;

    if (this.selectedCount === null) {
      this.display(state, this.previousLiveState);
    }
  }

  addEvent(event: CartEvent): void {
    this.emptyNote.hidden = true;

    const count = this.history.events.length;
    const button = createElement('button', { text: `${count}. ${event.type}` });
    button.type = 'button';
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => this.select(count));
    this.eventButtons.push(button);

    const payload = createElement('pre', { text: JSON.stringify(event, null, 2) });
    const item = createElement('li');
    item.append(button, payload);
    this.eventList.append(item);
  }

  private select(count: number): void {
    this.selectedCount = count;
    this.display(this.history.rebuild(count), this.history.rebuild(count - 1));

    this.source.textContent = `State rebuilt from events 1 to ${count}`;
    this.backToLiveButton.hidden = false;
    this.markPressed(count);
  }

  private backToLive(): void {
    this.selectedCount = null;
    this.display(this.liveState, this.previousLiveState);

    this.source.textContent = 'Live state';
    this.backToLiveButton.hidden = true;
    this.markPressed(null);
  }

  // Highlights the block that changed between the two states.
  private display(state: CartState, before: CartState): void {
    this.domainModel.textContent = JSON.stringify(state.cart, null, 2);
    this.flowStatus.textContent = JSON.stringify({ status: state.status }, null, 2);

    const cartChanged = JSON.stringify(state.cart) !== JSON.stringify(before.cart);
    this.domainModel.classList.toggle('changed', cartChanged);
    this.flowStatus.classList.toggle('changed', state.status !== before.status);
  }

  private markPressed(count: number | null): void {
    this.eventButtons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index + 1 === count));
    });
  }
}
