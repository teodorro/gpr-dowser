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

// export const getCmpLineLoza = (
//   distance: number,
//   depth: number,
//   velocity: number,
// ) => {
//   const part1 = 1 / velocity;
//   const part2 = Math.sqrt(Math.pow(depth * 2, 2) + Math.pow(distance, 2));
//   const part3 = distance / VELOCITY_LIGHT;
//   return part1 * part2 - part3;
// };

export const getCmpLinePoint = (
  time: number,
  velocity: number,
  distance: number,
  options?: { loza: boolean },
) => {
  const part1 = 1 / velocity;
  const part2 = Math.sqrt(Math.pow(time * velocity, 2) + Math.pow(distance, 2));
  const part3 = options?.loza ? distance / VELOCITY_LIGHT : 0;
  return part1 * part2 - part3;
};

export const getDixFormula = (
  time: number,
  rmsVelocity: number,
  prevTime: number,
  prevVelocity: number,
) => {
  const part1 = rmsVelocity ** 2 * time - prevVelocity ** 2 * prevTime;
  const part2 = time - prevTime;
  return part1 < 0 ? 0 : Math.sqrt(part1 / part2);
};
