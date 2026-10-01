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

export default function CmpSemblanceToolbar() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return (
      <div className="flex flex-col flex-1 min-w-0 min-h-0 rounded-lg bg-scan text-scan-foreground" />
    );
  }

  return <CmpSemblanceToolbarInternal store={store} />;
}

function CmpSemblanceToolbarInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();

  const cmpShiftX = useStore(store, (s) => s.cmpShiftX);
  const setCmpShift = useStore(store, (s) => s.setCmpShift);

  const handleMoveToLeftTopCorner = () => {
    setCmpShift(TIME_AXIS_WIDTH, LENGTH_AXIS_HEIGHT);
  };

  const handleMoveToTopBorder = () => {
    setCmpShift(cmpShiftX, LENGTH_AXIS_HEIGHT);
  };

  return (
    <div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleMoveToLeftTopCorner}
          >
            <ArrowUpLeftIcon className="w-3 h-3" />
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
            <ArrowUpToLineIcon className="w-3 h-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('MoveToTopBorder')}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
