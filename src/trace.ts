import { messageDefinitions, type MessageDefinition } from './messages';

// One message as it happened. It says which of the eleven it was, in which
// user action, and how long after the click that started the action.
export interface TracedMessage {
  number: number;
  definition: MessageDefinition;
  action: number;
  actionTitle: string;
  elapsedMs: number;
}

type TraceListener = (message: TracedMessage) => void;

// Collects the messages as the paper's code runs and passes each one to the
// panels that display it.
export class Trace {
  private action = 0;
  private actionTitle = '';
  private actionStart = 0;
  private readonly listeners: TraceListener[] = [];

  // Every action starts with a click, which is message 1.
  beginAction(title: string): void {
    this.action += 1;
    this.actionTitle = title;
    this.actionStart = performance.now();
    this.record(1);
  }

  subscribe(listener: TraceListener): void {
    this.listeners.push(listener);
  }

  record(number: number): void {
    const message: TracedMessage = {
      number,
      definition: messageDefinitions[number],
      action: this.action,
      actionTitle: this.actionTitle,
      elapsedMs: Math.round(performance.now() - this.actionStart),
    };

    for (const listener of this.listeners) {
      listener(message);
    }
  }
}
