import type Grid2D from '@/shared/grid2d';
import type { Operation } from '@/stores/undo-redo.types';

// to remove some properties from the Operation type
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

export type OperationParams = DistributiveOmit<
  Operation,
  'snapshot' | 'leftDataSliceId' | 'rightDataSliceId' | 'relief'
>;

export type OperationResult = {
  bScan: Grid2D;
  right?: Grid2D;
};

export type GridPayload = {
  cols: number;
  rows: number;
  buf: Float32Array;
};

export type OperationRequest = {
  id: number;
  bScan: GridPayload;
  params: OperationParams;
};

export type OperationResponse =
  | { id: number; ok: true; bScan: GridPayload; right?: GridPayload }
  | { id: number; ok: false; error: string };
