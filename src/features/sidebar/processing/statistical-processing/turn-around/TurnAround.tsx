import { Button } from '@/components/ui/button';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import turnAroundBscan from './turn-around-bscan';
import { RepeatIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { Label } from '@/components/ui/label';

export default function TurnAround() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <TurnAroundInternal key={selectedFileId} store={store} />;
}

function TurnAroundInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const bScan = useStore(store, (state) => state.bScan);
  const setBScan = useStore(store, (state) => state.setBScan);
  const addOperation = useStore(store, (state) => state.addOperation);

  const handleTurnAroundSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBScan(turnAroundBscan(bScan));
    addOperation({ type: 'turn_around_bscan' });
  };

  return (
    <form className="flex flex-row" onSubmit={handleTurnAroundSubmit}>
      <Button variant="outline" size="icon" type="submit" className="mr-2">
        <RepeatIcon />
      </Button>
      <Label className="flex-1 gap-2">{t('TurnAround')}</Label>
    </form>
  );
}
