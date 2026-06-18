import { Field, FieldLabel } from '@/components/ui/field';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useStore } from 'zustand';
import { useEffect, useState } from 'react';

export default function XStep() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <XStepInternal key={selectedFileId} store={store} />;
}

function XStepInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const dx = useStore(store, (state) => state.dx);
  const setDx = useStore(store, (state) => state.setDx);

  const [internalDx, setInternalDx] = useState<string>(dx?.toString() ?? '');

  useEffect(() => {
    if (internalDx !== '') {
      setDx(Number(internalDx));
    }
  }, [internalDx, setDx]);

  return (
    <Field>
      <FieldLabel htmlFor="x-step">{t('XStep')}</FieldLabel>
      <Input
        id="x-step"
        type="number"
        min={0}
        step="0.1"
        placeholder={t('EnterXStep')}
        value={internalDx}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || Number(v) >= 0) setInternalDx(v);
        }}
        onBlur={() => {
          setInternalDx(dx?.toString() ?? '');
        }}
      />
    </Field>
  );
}
