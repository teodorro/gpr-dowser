import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { getRound } from '@/shared/get-round';
import {
  dataSliceStores,
  type CmpLayer,
  type DataStore,
} from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { Trash2Icon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

export default function CmpLayersTable() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <CmpLayersTableInternal key={selectedFileId} store={store} />;
}

function CmpLayersTableInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const cmpLayers = useStore(store, (state) => state.cmpLayers);
  const removeCmpLayer = useStore(store, (state) => state.removeCmpLayer);
  const isWrongLayer = (layer: CmpLayer): boolean => {
    return (
      getRound(layer.velocity) === '0' ||
      Number.isNaN(layer.velocity) ||
      !Number.isFinite(layer.velocity) ||
      getRound(layer.thickness) === '0' ||
      Number.isNaN(layer.thickness) ||
      !Number.isFinite(layer.thickness)
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-scan p-1 rounded-md border border-border">
      <Table containerClassName="h-full min-h-0">
        <TableHeader className="[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-background">
          <TableRow>
            <TableHead>{t('Time')}</TableHead>
            <TableHead>{t('Velocity')}</TableHead>
            <TableHead>{t('PermittivityShort')}</TableHead>
            <TableHead>{t('Thickness')}</TableHead>
            <TableHead>{t('TotalThickness')}</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cmpLayers.layers.map((layer) => (
            <TableRow
              key={layer.id}
              className={cn(isWrongLayer(layer) ? 'bg-red-500' : '')}
            >
              <TableCell>{getRound(layer.time, 0)}</TableCell>
              <TableCell
                className={cn(
                  isWrongLayer(layer)
                    ? 'bg-red-500'
                    : layer.velocity > 0.173 || layer.velocity < 0.047
                      ? 'bg-red-100'
                      : '',
                )}
              >
                {getRound(layer.velocity)}
              </TableCell>
              <TableCell
                className={cn(
                  isWrongLayer(layer)
                    ? 'bg-red-500'
                    : layer.permittivity > 40 || layer.permittivity < 3
                      ? 'bg-red-100'
                      : '',
                )}
              >
                {getRound(layer.permittivity)}
              </TableCell>
              <TableCell
                className={cn(
                  isWrongLayer(layer)
                    ? 'bg-red-500'
                    : layer.thickness > 50 || layer.thickness < 0.01
                      ? 'bg-red-100'
                      : '',
                )}
              >
                {getRound(layer.thickness)}
              </TableCell>
              <TableCell>{getRound(layer.totalThickness)}</TableCell>
              <TableCell className="p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCmpLayer(layer.id)}
                >
                  <Trash2Icon />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
