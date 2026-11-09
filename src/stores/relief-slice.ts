import { sampleRelief } from '@/shared/sample-relief';

export const RELIEF_POINT_GAP = 5;

type ReliefPoints = [number, number][];

type ReliefState = {
  relief: ReliefPoints;
  selectedReliefPoint: [number, number] | undefined;
};

type ReliefActions = {
  setRelief: (relief: ReliefPoints) => void;
  setSelectedReliefPoint: (
    selectedReliefPoint: [number, number] | undefined,
  ) => void;
};

export type ReliefSlice = ReliefState & ReliefActions;

export const mirrorRelief = (relief: ReliefPoints, cols: number) =>
  relief.map(([x, y]): [number, number] => [cols - 1 - x, y]).reverse();

export const splitRelief = (
  relief: ReliefPoints,
  splitIndex: number,
): [ReliefPoints, ReliefPoints] => {
  const splitValue = sampleRelief(relief, splitIndex + 1)[splitIndex];
  return [
    [...relief.filter(([x]) => x < splitIndex), [splitIndex, splitValue]],
    [
      [0, splitValue],
      ...relief
        .filter(([x]) => x > splitIndex)
        .map(([x, y]): [number, number] => [x - splitIndex, y]),
    ],
  ];
};
