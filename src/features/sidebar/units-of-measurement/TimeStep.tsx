import { Field, FieldLabel } from '@/components/ui/field';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useStore } from 'zustand';
import { useEffect, useState } from 'react';

export default function TimeStep() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }
  return <TimeStepInternal key={selectedFileId} store={store} />;
}

function TimeStepInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const dt = useStore(store, (state) => state.dt);
  const setDt = useStore(store, (state) => state.setDt);

  const [internalDt, setInternalDt] = useState<string>(dt.toString());

  useEffect(() => {
    if (internalDt !== '') {
      setDt(Number(internalDt));
    }
  }, [internalDt, setDt]);

  return (
    <Field>
      <FieldLabel htmlFor="time-step">{t('TimeStep')}</FieldLabel>
      <Input
        id="time-step"
        type="number"
        min={0}
        step="0.5"
        placeholder={t('EnterTimeStep')}
        value={internalDt}
        onChange={(e) => {
          const v = e.target.value;
          if (v === '' || Number(v) >= 0) setInternalDt(v);
        }}
        onBlur={() => {
          setInternalDt(dt.toString());
        }}
      />
    </Field>
  );
}
