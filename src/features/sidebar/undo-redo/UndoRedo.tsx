import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { ClipboardPasteIcon, RedoIcon, UndoIcon } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

export default function UndoRedo() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <UndoRedoInternal key={selectedFileId} store={store} />;
}

function UndoRedoInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const history = useStore(store, (state) => state.history);

  console.log(t('dewow'));

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <Button variant="outline" size="icon">
          <UndoIcon className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <RedoIcon className="w-4 h-4" />
        </Button>
        <Button variant="outline" size="icon">
          <ClipboardPasteIcon className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="max-h-48 w-full rounded-md border">
        <div className="p-4">
          {history.map((operation) => (
            <React.Fragment key={operation.type}>
              <div className="text-sm">{t(`${operation.type.toString()}`)}</div>
              <Separator className="my-2" />
            </React.Fragment>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
