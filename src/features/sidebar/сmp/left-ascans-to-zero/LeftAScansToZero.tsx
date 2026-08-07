import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import Grid2D from '@/shared/grid2d';
import { type DataStore } from '@/stores/data-slice-stores';
import { useUiStore } from '@/stores/ui-store';
import { RectangleVerticalIcon, SaveIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { setLeftAScansToZero } from './set-left-ascans-to-zero';

export default function SetToZero({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const cmpMode = useUiStore.use.cmpMode();

  const initialBScan = useRef<Grid2D | null>(null);
  const bScan = useStore(store, (state) => state.bScan);
  const setBScan = useStore(store, (state) => state.setBScan);
  const addOperation = useStore(store, (state) => state.addOperation);

  const [open, setOpen] = useState(false);

  const [zeroBreakpoint, setZeroBreakpoint] = useState<number>(5);

  const [internalZeroBreakpoint, setInternalZeroBreakpoint] =
    useState<string>('5');

  const onOpenChange = (openState: boolean) => {
    setOpen(openState);
    if (openState) {
      initialBScan.current = bScan.clone();
      onZeroBreakpointChange(internalZeroBreakpoint);
    } else {
      setBScan(initialBScan.current ?? new Grid2D(0, 0, []));
      setInternalZeroBreakpoint('0');
    }
  };

  const onZeroBreakpointChange = (value: string) => {
    if (value === '') {
      setInternalZeroBreakpoint('');
      return;
    }
    const nextValue = Number(value);
    if (Number.isFinite(nextValue)) {
      setInternalZeroBreakpoint(value);
      setZeroBreakpoint(nextValue);
      setBScan(
        setLeftAScansToZero(
          initialBScan.current?.clone() ?? new Grid2D(0, 0, []),
          nextValue,
        ),
      );
    }
  };

  const onSaveBscan = () => {
    setOpen(false);
    addOperation({ type: 'set_left_ascans_to_zero', zeroBreakpoint });
    setInternalZeroBreakpoint('0');
  };

  return (
    <div className="flex flex-row items-center my-1 ">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            disabled={!cmpMode}
            className="shrink-0"
          >
            <RectangleVerticalIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="flex flex-1 flex-row items-center">
            <FieldLabel className="flex-1 ml-2" htmlFor="zero-breakpoint">
              {t('ZeroBreakpoint')}
            </FieldLabel>
            <Input
              id="zero-breakpoint"
              type="number"
              min="0"
              max={bScan.cols}
              step="1"
              value={internalZeroBreakpoint}
              onChange={(e) => {
                const v = e.target.value;
                onZeroBreakpointChange(v);
              }}
              className="flex-1 max-w-24"
            />
          </div>
          <Button variant="outline" className="shrink-0" onClick={onSaveBscan}>
            <SaveIcon /> {t('Save')}
          </Button>
        </PopoverContent>
      </Popover>
      <FieldLabel className="flex-1 w-24 ml-2" htmlFor="set-to-zero">
        {t('SetToZeroLeftAScans')}
      </FieldLabel>
    </div>
  );
}
