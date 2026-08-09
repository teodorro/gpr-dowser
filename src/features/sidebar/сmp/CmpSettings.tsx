import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import SignalAligner from './signal-aligner/SignalAligner';
import CmpSemblanceLinesColor from './CmpSemblanceLinesColor';
import CmpBscanLinesColor from './CmpBscanLinesColor';
import LeftAScansToZero from './left-ascans-to-zero/LeftAScansToZero';
import DeltaToUpdateLayer from './DeltaToUpdateLayer';

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
  return (
    <div>
      <SignalAligner store={store} />
      <LeftAScansToZero store={store} />
      <DeltaToUpdateLayer />
      <CmpSemblanceLinesColor />
      <CmpBscanLinesColor />
    </div>
  );
}
