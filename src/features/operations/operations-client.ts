import Grid2D from '@/shared/grid2d';
import { executeOperation } from './execute-operation';
import type {
  GridPayload,
  OperationParams,
  OperationRequest,
  OperationResponse,
  OperationResult,
} from './operation-params';

type Pending = {
  resolve: (result: OperationResult) => void;
  reject: (error: Error) => void;
};

let worker: Worker | null = null;
let nextId = 0;
const pending = new Map<number, Pending>();

const fromPayload = (payload: GridPayload) =>
  new Grid2D(payload.cols, payload.rows, payload.buf);

const failAll = (error: Error) => {
  for (const request of pending.values()) request.reject(error);
  pending.clear();
};

const getWorker = (): Worker => {
  if (worker) return worker;
  const created = new Worker(
    new URL('./operations-worker.ts', import.meta.url),
    { type: 'module' },
  );
  created.onmessage = (e: MessageEvent<OperationResponse>) => {
    const request = pending.get(e.data.id);
    if (!request) return;
    pending.delete(e.data.id);
    if (e.data.ok) {
      request.resolve({
        bScan: fromPayload(e.data.bScan),
        right: e.data.right ? fromPayload(e.data.right) : undefined,
      });
    } else {
      request.reject(new Error(e.data.error));
    }
  };
  created.onerror = (e) => {
    created.terminate();
    if (worker === created) worker = null;
    failAll(new Error(e.message || 'Operations worker failed'));
  };
  worker = created;
  return created;
};

export const computeOperation = (
  bScan: Grid2D,
  params: OperationParams,
): Promise<OperationResult> => {
  if (typeof Worker === 'undefined') {
    return Promise.resolve().then(() => executeOperation(bScan, params));
  }
  return new Promise((resolve, reject) => {
    const id = nextId++;
    pending.set(id, { resolve, reject });
    const request: OperationRequest = {
      id,
      bScan: { cols: bScan.cols, rows: bScan.rows, buf: bScan.buffer },
      params,
    };
    try {
      getWorker().postMessage(request);
    } catch (error) {
      pending.delete(id);
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
};
