import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Grid2D from '@/shared/grid2d';
import { useUiStore } from '@/stores/ui-store';
import { SaveIcon, SignpostIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { alignSignal } from './align-signal';
import type { DataStore } from '@/stores/data-slice-stores';

export default function SignalAligner({ store }: { store: DataStore }) {
  const cmpMode = useUiStore.use.cmpMode();
  const { t } = useTranslation();

  const initialBScan = useRef<Grid2D | null>(null);
  const bScan = useStore(store, (state) => state.bScan);
  const setBScan = useStore(store, (state) => state.setBScan);
  const addOperation = useStore(store, (state) => state.addOperation);

  const [open, setOpen] = useState(false);

  const [ampBreakpoint, setAmpBreakpoint] = useState<number>(0);

  const [internalAmpBreakpoint, setInternalAmpBreakpoint] =
    useState<string>('0');

  const onOpenChange = (openState: boolean) => {
    setOpen(openState);
    if (openState) {
      initialBScan.current = bScan.clone();
      onAmpBreakpointChange(internalAmpBreakpoint);
    } else {
      setBScan(initialBScan.current ?? new Grid2D(0, 0, []));
      setInternalAmpBreakpoint('0');
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
      setBScan(
        alignSignal(
          initialBScan.current?.clone() ?? new Grid2D(0, 0, []),
          nextValue,
        ),
      );
    }
  };

  const onSaveBscan = () => {
    setOpen(false);
    addOperation({ type: 'cmp_align_signal', ampBreakpoint });
    setInternalAmpBreakpoint('0');
  };

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
          <Button variant="outline" className="shrink-0" onClick={onSaveBscan}>
            <SaveIcon /> {t('Save')}
          </Button>
        </PopoverContent>
      </Popover>
      <FieldLabel className="flex-1 w-24 ml-2" htmlFor="align-signal">
        {t('AlignSignal')}
      </FieldLabel>
    </div>
  );
}
