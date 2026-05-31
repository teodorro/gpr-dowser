import { createSelectors } from "@/shared/create-selectors";
import { create } from "zustand";

type FileRegistryState = {
  fileIds: string[];
  selectedFileId: string | null;
};

type FileRegistryActions = {
  addFile: (id: string) => void;
  removeFile: (id: string) => void;
  selectFile: (id: string) => void;
};

type FileRegistry = FileRegistryState & FileRegistryActions;

const INITIAL_STATE: FileRegistryState = {
  fileIds: [],
  selectedFileId: null,
};

const useFileRegistryBase = create<FileRegistry>((set) => ({
  ...INITIAL_STATE,

  addFile: (id) => set((s) => ({ ...s, fileIds: [...s.fileIds, id] })),
  removeFile: (id) =>
    set((s) => ({ ...s, fileIds: s.fileIds.filter((f) => f !== id) })),
  selectFile: (id) =>
    set((s) => ({ ...s, selectedFileId: s.fileIds.includes(id) ? id : null })),
}));

const useFileRegistry = createSelectors(useFileRegistryBase);

export default useFileRegistry;
