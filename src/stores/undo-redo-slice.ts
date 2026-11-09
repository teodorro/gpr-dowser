import type { Operation } from './undo-redo.types';

type UndoRedoState = {
  history: Map<number, Operation>;
  position: number;
};

type UndoRedoActions = {
  undo: () => void;
  redo: () => void;
  addOperation: (operation: Operation) => void;
  replaceOperation: (operation: Operation) => void;
};

export type UndoRedoSlice = UndoRedoState & UndoRedoActions;
