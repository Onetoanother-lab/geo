import { advance, applyTool, createInitialState, type SimState, type Tool } from './model';

export type SimAction = { type: 'apply'; index: number; tool: Tool } | { type: 'advance' } | { type: 'reset' };

export function simReducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case 'apply':
      return applyTool(state, action.index, action.tool);
    case 'advance':
      return advance(state);
    case 'reset':
      return createInitialState();
  }
}
