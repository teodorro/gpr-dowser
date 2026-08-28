import { VELOCITY_LIGHT } from '@/shared/gpr-math';
import Grid2D from '@/shared/grid2d';

function addLozaCmpShift(bScan: Grid2D, dx: number, dt: number): Grid2D {
  const newBScan = new Grid2D(bScan.cols, bScan.rows);
  for (let i = 0; i < bScan.cols; i++) {
    const deltaT = Math.round((i * dx) / VELOCITY_LIGHT / dt);
    for (let j = 0; j < bScan.rows; j++) {
      if (j < deltaT) {
        newBScan.set(i, j, 0);
      } else {
        newBScan.set(i, j, bScan.get(i, j - deltaT));
      }
    }
  }
  return newBScan;
}

export default addLozaCmpShift;
