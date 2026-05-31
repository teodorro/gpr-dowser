import { loadDataFile } from "@/file-parsers/load-data-file";

export const loadFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files) {
    Array.from(event.target.files).forEach((file) => {
      loadDataFile(file);
    });
  }
};
