type FileState = {
  name: string;
  path: string;
  type: string;
};

type FileActions = {
  setName: (name: string) => void;
  setPath: (path: string) => void;
  setType: (type: string) => void;
};

export type FileSlice = FileState & FileActions;
