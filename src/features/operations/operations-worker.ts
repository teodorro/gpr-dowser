import Grid2D from '@/shared/grid2d';
import { executeOperation } from './execute-operation';
import type {
  GridPayload,
  OperationRequest,
  OperationResponse,
} from './operation-params';

const toPayload = (grid: Grid2D): GridPayload => ({
  cols: grid.cols,
  rows: grid.rows,
  buf: grid.buffer,
});

self.onmessage = (e: MessageEvent<OperationRequest>) => {
  const { id, bScan, params } = e.data;
  let response: OperationResponse;
  const transfer: Transferable[] = [];
  try {
    const result = executeOperation(
      new Grid2D(bScan.cols, bScan.rows, bScan.buf),
      params,
    );
    response = { id, ok: true, bScan: toPayload(result.bScan) };
    transfer.push(response.bScan.buf.buffer);
    if (result.right) {
      response.right = toPayload(result.right);
      transfer.push(response.right.buf.buffer);
    }
  } catch (error) {
    response = {
      id,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
  self.postMessage(response, { transfer });
};
