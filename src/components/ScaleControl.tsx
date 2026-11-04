import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MAX_SCALE, MIN_SCALE } from '@/stores/data-slice-stores';
import clamp from '@/visual/clamp';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const toPercent = (scale: number) => Math.round(scale * 100);

type ScaleControlProps = {
  scale: number;
  onScaleChange: (scale: number) => void;
};

export default function ScaleControl({
  scale,
  onScaleChange,
}: ScaleControlProps) {
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');

  const commit = () => {
    const percent = Number(draft);
    if (draft.trim() === '' || !Number.isFinite(percent)) return;
    if (percent === toPercent(scale)) return;
    onScaleChange(clamp(percent / 100, MIN_SCALE, MAX_SCALE));
  };

  const onOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(String(toPercent(scale)));
    } else {
      commit();
    }
    setOpen(nextOpen);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              className="mr-1 px-1 font-normal text-gray-400"
            >
              {toPercent(scale)}%
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('Scale')}</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        className="w-auto"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
      >
        <div className="flex flex-row items-center gap-2">
          <Input
            type="number"
            aria-label={t('Scale')}
            min={MIN_SCALE * 100}
            max={MAX_SCALE * 100}
            step={1}
            value={draft}
            onFocus={(e) => e.target.select()}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onOpenChange(false);
            }}
            className="w-24"
          />
          <span className="text-sm">%</span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
