import { createSelectors } from '@/shared/create-selectors';
import { create } from 'zustand';

type FileRegistryState = {
  fileIds: string[];
  selectedFileId: string | undefined;
};

type FileRegistryActions = {
  addFile: (id: string) => void;
  removeFile: (id: string) => void;
  selectFile: (id: string) => void;
};

type FileRegistry = FileRegistryState & FileRegistryActions;

const INITIAL_STATE: FileRegistryState = {
  fileIds: [],
  selectedFileId: undefined,
};

const useFileRegistryBase = create<FileRegistry>((set, get) => ({
  ...INITIAL_STATE,

  addFile: (id) => {
    set((s) => ({ ...s, fileIds: [...s.fileIds, id] }));
    set((s) => ({ ...s, selectedFileId: id }));
  },
  removeFile: (id) => {
    const { selectedFileId, fileIds } = get();
    if (selectedFileId === id) {
      if (fileIds.length > 1) {
        let index = fileIds.indexOf(id);
        index = index > 0 ? index - 1 : index + 1;
        set((s) => ({ ...s, selectedFileId: s.fileIds[index] }));
      } else {
        set((s) => ({ ...s, selectedFileId: undefined }));
      }
    }
    set((s) => ({ ...s, fileIds: s.fileIds.filter((f) => f !== id) }));
  },
  selectFile: (id) =>
    set((s) => ({
      ...s,
      selectedFileId: s.fileIds.includes(id) ? id : undefined,
    })),
}));

const useFileRegistryStore = createSelectors(useFileRegistryBase);

export default useFileRegistryStore;
