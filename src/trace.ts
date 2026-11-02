export const roles = { user: 'User', ui: 'Reactive Interface', flow: 'Flow Orchestrator', state: 'State Modules', adapter: 'Infrastructure Adapters', api: 'APIs & Services' };
export type Role = keyof typeof roles;
export const messages: Record<number, [Role, Role, string]> = {
  1: ['user', 'ui', 'interaction'], 2: ['ui', 'flow', 'ADD_ITEM_REQUESTED'],
  3: ['flow', 'state', 'applies event (loading)'], 4: ['state', 'ui', 'notifies state (loading)'],
  5: ['flow', 'adapter', 'addItem(productId)'], 6: ['adapter', 'api', 'request'],
  7: ['api', 'adapter', 'response'], 8: ['adapter', 'flow', 'item or handled error'],
  9: ['flow', 'state', 'applies SUCCEEDED or FAILED'], 10: ['state', 'ui', 'notifies state (final)'],
  11: ['ui', 'user', 're-renders'],
};
export interface Message { number: number; cycle: number; time: number; title: string }
export class Trace {
  private cycle = 0;
  private start = 0;
  private title = '';
  private listeners: ((message: Message) => void)[] = [];
  begin(title: string): void { this.cycle++; this.start = performance.now(); this.title = title; this.emit(1); }
  subscribe(listener: (message: Message) => void): void { this.listeners.push(listener); }
  emit(number: number): void {
    const message = { number, cycle: this.cycle, time: Math.round(performance.now() - this.start), title: this.title };
    this.listeners.forEach(listener => listener(message));
  }
}
