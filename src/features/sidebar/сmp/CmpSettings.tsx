import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import SignalAligner from './signal-aligner/SignalAligner';
import CmpLayers from './CmpLayers';
import { useStore } from 'zustand';
import CmpSemblanceLinesColor from './CmpSemblanceLinesColor';
import CmpBscanLinesColor from './CmpBscanLinesColor';
import LeftAScansToZero from './left-ascans-to-zero/LeftAScansToZero';

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
      <LeftAScansToZero store={store} />
      <CmpSemblanceLinesColor />
      <CmpBscanLinesColor />
      {cmpLayers.layers.length > 0 && <CmpLayers />}
    </div>
  );
}
