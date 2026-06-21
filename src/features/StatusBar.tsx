import { TypographySmall } from '@/components/ui/typography';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useStore } from 'zustand';

export default function StatusBar() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }

  return (
    <div>
      <StatusBarInternal store={store} />
    </div>
  );
}

function StatusBarInternal({ store }: { store: DataStore }) {
  const indexX = useStore(store, (s) => s.indexX);
  const indexY = useStore(store, (s) => s.indexY);
  const dx = useStore(store, (s) => s.dx);
  const dt = useStore(store, (s) => s.dt);
  const velocity = useStore(store, (s) => s.velocity);

  return (
    <div className="flex flex-row gap-3 p-1 min-h-8">
      {indexX !== undefined && (
        <div className="w-16">
          <TypographySmall>
            x: {parseFloat((indexX * dx).toFixed(2)).toString()}
          </TypographySmall>
        </div>
      )}
      {indexY !== undefined && (
        <div className="w-16">
          <TypographySmall>
            t: {parseFloat((indexY * dt).toFixed(2)).toString()}
          </TypographySmall>
        </div>
      )}
      {indexY !== undefined && (
        <div className="w-16">
          <TypographySmall>
            z:{' '}
            {parseFloat(((velocity * indexY * dt) / 2).toFixed(4)).toString()}
          </TypographySmall>
        </div>
      )}
    </div>
  );
}
