import { useCallback, useReducer } from 'react'
import type { SelectionMap } from '../components/CharacterComposite'

type State = { stacks: SelectionMap[]; i: number }

type Action =
  | { type: 'set'; next: SelectionMap }
  | { type: 'undo' }
  | { type: 'redo' }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'set': {
      const stacks = [...state.stacks.slice(0, state.i + 1), action.next]
      return { stacks, i: stacks.length - 1 }
    }
    case 'undo':
      return state.i > 0 ? { ...state, i: state.i - 1 } : state
    case 'redo':
      return state.i < state.stacks.length - 1
        ? { ...state, i: state.i + 1 }
        : state
    default:
      return state
  }
}

export function useSelectionHistory(initial: SelectionMap) {
  const [{ stacks, i }, dispatch] = useReducer(reducer, {
    stacks: [initial],
    i: 0,
  })

  const selection = stacks[i] ?? initial

  const setSelection = useCallback((next: SelectionMap) => {
    dispatch({ type: 'set', next })
  }, [])

  const undo = useCallback(() => dispatch({ type: 'undo' }), [])
  const redo = useCallback(() => dispatch({ type: 'redo' }), [])

  return {
    selection,
    setSelection,
    undo,
    redo,
    canUndo: i > 0,
    canRedo: i < stacks.length - 1,
  }
}
