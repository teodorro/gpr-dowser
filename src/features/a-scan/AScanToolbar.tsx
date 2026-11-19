import { dataSliceStores } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';

export default function AScanToolbar() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }

  return (
    <div className="shrink-0">
      <div className="flex flex-row gap-3 px-1 min-h-6"></div>
    </div>
  );
}
