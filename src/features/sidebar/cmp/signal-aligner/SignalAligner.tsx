import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Grid2D from '@/shared/grid2d';
import useUiStore from '@/stores/ui-store';
import { SignpostIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { reportOperationError } from '@/features/operations/apply-operation';
import { computeOperation } from '@/features/operations/operations-client';
import type { DataStore } from '@/stores/data-slice-stores';

export default function SignalAligner({ store }: { store: DataStore }) {
  const { t } = useTranslation();

  const initialBScan = useRef<Grid2D | null>(null);
  const initialAmpBreakpoint = useRef<number | undefined>(undefined);
  const previewRequest = useRef(0);
  const pendingPreview = useRef<Promise<void>>(Promise.resolve());

  const bScan = useStore(store, (state) => state.bScan);
  const setBScan = useStore(store, (state) => state.setBScan);
  const addOperation = useStore(store, (state) => state.addOperation);

  const cmpMode = useUiStore.use.cmpMode();
  const stopSemblanceMode = useUiStore.use.stopSemblanceMode();
  const setStopSemblanceMode = useUiStore.use.setStopSemblanceMode();

  const [open, setOpen] = useState(false);

  const [ampBreakpoint, setAmpBreakpoint] = useState<number | undefined>(
    undefined,
  );

  const [internalAmpBreakpoint, setInternalAmpBreakpoint] =
    useState<string>('undefined');

  const onOpenChange = (openState: boolean) => {
    setOpen(openState);
    if (openState) {
      initialBScan.current = bScan.clone();
      initialAmpBreakpoint.current = ampBreakpoint;
      setStopSemblanceMode(true);
      onAmpBreakpointChange(internalAmpBreakpoint);
    } else {
      setStopSemblanceMode(false);
    }
  };

  const onAmpBreakpointChange = (value: string) => {
    if (value === '') {
      setInternalAmpBreakpoint('');
      return;
    }
    const nextValue = Number(value);
    if (Number.isFinite(nextValue)) {
      setInternalAmpBreakpoint(value);
      setAmpBreakpoint(nextValue);
      const request = ++previewRequest.current;
      pendingPreview.current = computeOperation(
        initialBScan.current ?? new Grid2D(0, 0),
        { type: 'cmp_align_signal', ampBreakpoint: nextValue },
      ).then(
        (result) => {
          if (request === previewRequest.current) setBScan(result.bScan);
        },
        (error: unknown) => {
          if (request === previewRequest.current) {
            reportOperationError(error, 'cmp_align_signal');
          }
        },
      );
    }
  };

  useEffect(() => {
    if (stopSemblanceMode === false) {
      if (ampBreakpoint !== undefined) {
        void pendingPreview.current.then(() => {
          addOperation({
            type: 'cmp_align_signal',
            snapshot: store.getState().bScan,
            ampBreakpoint,
          });
        });
      }
    }
  }, [stopSemblanceMode]); // do not add ampBreakpoint, bScan, addOperation to dependencies

  return (
    <div className="flex flex-row items-center">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={!cmpMode}
            className="shrink-0"
          >
            <SignpostIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-row items-center">
            <FieldLabel
              className="shrink-0 w-24 ml-2"
              htmlFor="amplitude-breakpoint"
            >
              {t('AmplitudeBreakpoint')}
            </FieldLabel>
            <Input
              id="time-step"
              type="number"
              step="1"
              value={internalAmpBreakpoint}
              onChange={(e) => {
                const v = e.target.value;
                onAmpBreakpointChange(v);
              }}
              className="flex-1 max-w-24"
            />
          </div>
        </PopoverContent>
      </Popover>
      <FieldLabel className="flex-1 w-24 ml-2" htmlFor="align-signal">
        {t('AlignSignal')}
      </FieldLabel>
    </div>
  );
}
