export const getNextName = (name: string, names: string[]): string => {
  const usedNames = new Set(names);

  if (!usedNames.has(name)) {
    return name;
  }

  let index = 1;
  while (usedNames.has(`${name} (${index})`)) {
    index += 1;
  }

  return `${name} (${index})`;
};
