import useFileRegistryStore from '@/stores/file-registry-store';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import SignalAligner from './signal-aligner/SignalAligner';
import LeftAScansToZero from './left-ascans-to-zero/LeftAScansToZero';
import DeltaToUpdateLayer from './DeltaToUpdateLayer';
import CmpGateSlider from './CmpHalfwaveSlider';
import AddLozaCmpShift from './add-loza-cmp-shift/AddLozaCmpShift';
import Backshift from './Backshift';
import { Separator } from '@/components/ui/separator';

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
      <CmpGateSlider />
      <Backshift />
      <Separator />
      <AddLozaCmpShift />
    </div>
  );
}
