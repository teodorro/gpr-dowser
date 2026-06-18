import { loadDataFile } from '@/file-parsers/load-data-file';

export const loadFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
  const input = event.target;
  if (input.files) {
    Array.from(input.files).forEach((file) => {
      loadDataFile(file);
    });
  }
  input.value = '';
};
