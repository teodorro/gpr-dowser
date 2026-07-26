import type Grid2D from '@/shared/grid2d';

///
// Align direct signal to be straight
// Loza GPR receiver starts by receiving a pulse so
// on a bigger distance it starts later than on a smaller distance
// so we need to align the signal to be straight
// by adding zeros to the start of the A-Scans
export const alignSignal = (bScan: Grid2D, ampBreakpoint: number): Grid2D => {
  const zeros: number[] = [];
  for (let i = 0; i < bScan.cols; i++) {
    const aScan = bScan.getColumn(i);
    for (let j = 1; j < aScan.length; j++) {
      const amplitudeBefore = aScan[j - 1];
      const amplitudeAfter = aScan[j + 1];
      if (amplitudeBefore >= ampBreakpoint && amplitudeAfter < ampBreakpoint) {
        zeros.push(j);
        break;
      }
    }
  }
  const maxZero = Math.max(...zeros);
  const spaceToAdd = zeros.map((zero) => maxZero - zero);
  for (let i = 0; i < bScan.cols; i++) {
    const aScan = [...bScan.getColumn(i)];
    for (let j = -spaceToAdd[i]; j < aScan.length - spaceToAdd[i]; j++) {
      bScan.set(i, j + spaceToAdd[i], j < 0 ? 0 : aScan[j]);
    }
  }
  return bScan;
};
