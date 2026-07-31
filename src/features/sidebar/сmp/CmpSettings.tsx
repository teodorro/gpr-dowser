import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import SignalAligner from './SignalAligner';
import CmpLayers from './CmpLayers';
import { useStore } from 'zustand';
import CmpSemblanceLinesColor from './CmpSemblanceLinesColor';
import CmpBscanLinesColor from './CmpBscanLinesColor';

export default function CmpSettings() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <CmpSettingsInternal key={selectedFileId} store={store} />;
}

function CmpSettingsInternal({ store }: { store: DataStore }) {
  const cmpLayers = useStore(store, (state) => state.cmpLayers);

  return (
    <div>
      <SignalAligner store={store} />
      <CmpSemblanceLinesColor />
      <CmpBscanLinesColor />
      {cmpLayers.length > 0 && <CmpLayers />}
    </div>
  );
}
