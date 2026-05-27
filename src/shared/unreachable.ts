export const unreachable = (value: never): never => {
  throw new Error(`Unreachable value: ${value}`);
};
