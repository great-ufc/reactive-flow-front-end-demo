import { byId, createElement } from '../dom';
import { roleNames, type Role } from '../messages';
import type { Trace, TracedMessage } from '../trace';

// Lists every message as it happens, grouped by the user action that caused it.
export class TracePanel {
  private readonly groups = byId('trace-groups');
  private readonly emptyNote = byId('trace-empty');
  private currentAction = -1;
  private currentList: HTMLOListElement | null = null;

  constructor(trace: Trace) {
    trace.subscribe((message) => this.add(message));
    byId('clear-trace').addEventListener('click', () => this.clear());
  }

  private add(message: TracedMessage): void {
    if (message.action !== this.currentAction || !this.currentList) {
      this.currentList = this.startGroup(message);
      this.currentAction = message.action;
    }
    this.currentList.append(this.createRow(message));
  }

  private startGroup(message: TracedMessage): HTMLOListElement {
    this.emptyNote.hidden = true;

    const group = createElement('details');
    group.open = true;
    const title = createElement('summary', {
      text: `Action ${message.action}: ${message.actionTitle}`,
    });
    const list = createElement('ol', { className: 'trace-list' });

    group.append(title, list);
    this.groups.append(group);
    return list;
  }

  private createRow(message: TracedMessage): HTMLLIElement {
    const { from, to, label } = message.definition;
    const row = createElement('li', { className: 'trace-row' });

    row.append(
      createElement('span', { className: 'message-number', text: String(message.number) }),
      createElement('span', { className: 'elapsed', text: `+${message.elapsedMs} ms` }),
      createRoute(from, to),
      createElement('strong', { text: label }),
    );
    return row;
  }

  private clear(): void {
    this.groups.replaceChildren();
    this.emptyNote.hidden = false;
    this.currentAction = -1;
    this.currentList = null;
  }
}

function createRoute(from: Role, to: Role): HTMLElement {
  const route = createElement('span', { className: 'route' });
  route.append(
    createElement('span', { className: `chip role-${from}` }),
    `${roleNames[from]} to `,
    createElement('span', { className: `chip role-${to}` }),
    roleNames[to],
  );
  return route;
}
