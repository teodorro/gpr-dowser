import { ScrollArea } from '@/components/ui/scroll-area';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { Table, TableRow } from '@/components/ui/table';
import { TableBody, TableCell } from '@/components/ui/table';
import { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';

export default function CmpLayers() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <CmpLayersInternal key={selectedFileId} store={store} />;
}

const CmpLayersInternal = ({ store }: { store: DataStore }) => {
  const { t } = useTranslation();

  const cmpLayers = useStore(store, (state) => state.cmpLayers);
  const viewportRef = useRef<HTMLDivElement>(null);
  const removeCmpLayer = useStore(store, (state) => state.removeCmpLayer);

  const sortedCmpLayers = useMemo(() => {
    return [...cmpLayers].sort((a, b) => a.time - b.time);
  }, [cmpLayers]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [cmpLayers.length]);

  return (
    <div className="flex flex-col gap-2 my-1">
      <ScrollArea
        viewportRef={viewportRef}
        className="max-h-64 w-full rounded-md bg-secondary/20 border"
      >
        {sortedCmpLayers.map((layer) => (
          <div key={layer.id} className="flex flex-col gap-2 bg-secondary/20">
            <div className="relative text-sm border border-secondary rounded-md bg-sidebar p-1 m-1">
              <Button
                variant="outline"
                size="icon"
                className="absolute top-1 right-1 z-10"
                onClick={() => removeCmpLayer(layer.id)}
              >
                <TrashIcon className="w-4 h-4" />
              </Button>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>{t('Time')}</TableCell>
                    <TableCell>{layer.time} s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>{t('Velocity')}</TableCell>
                    <TableCell>
                      {Math.round(layer.velocity * 1000) / 1000} m/s
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};
