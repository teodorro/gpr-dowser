import type { Operation } from './undo-redo.types';

type UndoRedoState = {
  history: Operation[];
  position: number;
};

type UndoRedoActions = {
  undo: () => void;
  redo: () => void;
  addOperation: (operation: Operation) => void;
};

export type UndoRedoSlice = UndoRedoState & UndoRedoActions;
