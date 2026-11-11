import { Button } from '@/components/ui/button';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import turnAroundBscan from './turn-around-bscan';
import { RepeatIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { Label } from '@/components/ui/label';
import { mirrorRelief } from '@/stores/relief-slice';

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
  const setRelief = useStore(store, (state) => state.setRelief);

  const handleTurnAroundSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = turnAroundBscan(bScan);
    setBScan(data);
    setRelief(mirrorRelief(store.getState().relief, bScan.cols));
    addOperation({ type: 'turn_around_bscan', snapshot: data });
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
