export const VELOCITY_LIGHT = 0.3;
export const PERMITTIVITY_AIR = 1;
export const PERMITTIVITY_WATER = 81;
export const VELOCITY_WATER = VELOCITY_LIGHT / Math.sqrt(PERMITTIVITY_WATER);

export const getDepth = (time: number, velocity: number) => {
  return (time * velocity) / 2;
};

export const getPermittivity = (velocity: number) => {
  return Math.pow(VELOCITY_LIGHT / velocity, 2);
};

export const getVelocity = (permittivity: number) => {
  return VELOCITY_LIGHT / Math.sqrt(permittivity);
};

export const getCmpTimePoint = (
  distance: number,
  depth: number,
  velocity: number,
  options: { loza: boolean },
): number => {
  const part1 = 1 / velocity;
  const part2 = Math.sqrt(Math.pow(depth * 2, 2) + Math.pow(distance, 2));
  return options.loza
    ? part1 * part2 - distance / VELOCITY_LIGHT
    : part1 * part2;
};
