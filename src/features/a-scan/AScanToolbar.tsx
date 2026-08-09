import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
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
      <AScanToolbarInternal store={store} />
    </div>
  );
}

function AScanToolbarInternal({ store }: { store: DataStore }) {
  console.log(store.getState().dt);
  return <div className="flex flex-row gap-3 px-1 min-h-6"></div>;
}
