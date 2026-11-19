export class FileFormatError extends Error {
  readonly key: string;

  constructor(key: string) {
    super(key);
    this.name = 'FileFormatError';
    this.key = key;
  }
}
