// The roles of the pattern and the eleven numbered messages of the paper's
// sequence diagram. The page uses the same numbers and labels as the figure.

export type Role = 'user' | 'ui' | 'flow' | 'state' | 'adapter' | 'api';

export const roleNames: Record<Role, string> = {
  user: 'User',
  ui: 'Reactive Interface',
  flow: 'Flow Orchestrator',
  state: 'State Modules',
  adapter: 'Infrastructure Adapters',
  api: 'APIs & Services',
};

export interface MessageDefinition {
  from: Role;
  to: Role;
  label: string;
}

export const messageDefinitions: Record<number, MessageDefinition> = {
  1: { from: 'user', to: 'ui', label: 'interaction' },
  2: { from: 'ui', to: 'flow', label: 'ADD_ITEM_REQUESTED' },
  3: { from: 'flow', to: 'state', label: 'applies event (loading)' },
  4: { from: 'state', to: 'ui', label: 'notifies state (loading)' },
  5: { from: 'flow', to: 'adapter', label: 'addItem(productId)' },
  6: { from: 'adapter', to: 'api', label: 'request' },
  7: { from: 'api', to: 'adapter', label: 'response' },
  8: { from: 'adapter', to: 'flow', label: 'item or handled error' },
  9: { from: 'flow', to: 'state', label: 'applies SUCCEEDED or FAILED' },
  10: { from: 'state', to: 'ui', label: 'notifies state (final)' },
  11: { from: 'ui', to: 'user', label: 're-renders' },
};
