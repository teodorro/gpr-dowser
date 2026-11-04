import ScaleControl from '@/components/ScaleControl';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  dataSliceStores,
  LENGTH_AXIS_HEIGHT,
  TIME_AXIS_WIDTH,
  type DataStore,
} from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { ArrowUpLeftIcon, ArrowUpToLineIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

export default function BScanToolbar() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <BScanToolbarInternal store={store} />;
}

function BScanToolbarInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();

  const shiftX = useStore(store, (s) => s.shiftX);
  const shiftY = useStore(store, (s) => s.shiftY);
  const setShift = useStore(store, (s) => s.setShift);
  const scale = useStore(store, (s) => s.scale);
  const setScale = useStore(store, (s) => s.setScale);

  const handleScaleChange = (next: number) => {
    const ratio = next / scale;
    setShift(
      TIME_AXIS_WIDTH - (TIME_AXIS_WIDTH - shiftX) * ratio,
      LENGTH_AXIS_HEIGHT - (LENGTH_AXIS_HEIGHT - shiftY) * ratio,
    );
    setScale(next);
  };

  const handleMoveToLeftTopCorner = () => {
    setShift(TIME_AXIS_WIDTH, LENGTH_AXIS_HEIGHT);
  };

  const handleMoveToTopBorder = () => {
    setShift(shiftX, LENGTH_AXIS_HEIGHT);
  };

  return (
    <div className="flex flex-row gap-1 items-center mr-1">
      <ScaleControl scale={scale} onScaleChange={handleScaleChange} />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleMoveToLeftTopCorner}
          >
            <ArrowUpLeftIcon className="w-3 h-3 text-gray-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('MoveToLeftTopCorner')}</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleMoveToTopBorder}
          >
            <ArrowUpToLineIcon className="w-3 h-3 text-gray-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('MoveToTopBorder')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
