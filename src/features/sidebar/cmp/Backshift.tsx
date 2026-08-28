import { Button } from '@/components/ui/button';
import { FieldLabel } from '@/components/ui/field';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { LayersArrowUpIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

export default function Backshift() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <BackshiftInternal key={selectedFileId} store={store} />;
}

function BackshiftInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const backshift = useStore(store, (s) => s.backshift);
  const setBackshift = useStore(store, (s) => s.setBackshift);

  return (
    <div className="flex flex-col gap-2 my-2">
      <div className="flex flex-row items-center">
        <Button
          variant="outline"
          size="icon"
          type="submit"
          className={
            backshift ? 'border-2 border-primary dark:border-primary' : ''
          }
          onClick={(e) => {
            e.preventDefault();
            setBackshift(!backshift);
          }}
        >
          <LayersArrowUpIcon />
        </Button>
        <FieldLabel className="shrink-0 w-24 ml-2" htmlFor="backshift">
          {t('Backshift')}
        </FieldLabel>
      </div>
    </div>
  );
}
