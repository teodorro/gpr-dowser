import { FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { LIGHT_VELOCITY } from '@/shared/constants';
import { dataSliceStores, type DataStore } from '@/stores/data-slice-stores';
import useFileRegistryStore from '@/stores/file-registry-store';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from 'zustand';

export default function Velocity() {
  const selectedFileId = useFileRegistryStore.use.selectedFileId();
  const store = selectedFileId
    ? dataSliceStores.get(selectedFileId)
    : undefined;

  if (!store) {
    return null;
  }

  return <VelocityInternal key={selectedFileId} store={store} />;
}

function VelocityInternal({ store }: { store: DataStore }) {
  const { t } = useTranslation();
  const velocity = useStore(store, (state) => state.velocity);
  const setVelocity = useStore(store, (state) => state.setVelocity);
  const permittivity = useStore(store, (state) => state.permittivity);
  const setPermittivity = useStore(store, (state) => state.setPermittivity);

  const [internalVelocity, setInternalVelocity] = useState<string>(
    velocity.toString(),
  );
  const [internalPermittivity, setInternalPermittivity] = useState<string>(
    permittivity.toString(),
  );

  useEffect(() => {
    if (internalVelocity !== '') {
      setVelocity(Number(internalVelocity));
    }
  }, [internalVelocity, setVelocity]);

  useEffect(() => {
    if (internalPermittivity !== '') {
      setPermittivity(Number(internalPermittivity));
    }
  }, [internalPermittivity, setPermittivity]);

  const convertVelocityToPermittivity = (velocity: number) => {
    return (LIGHT_VELOCITY / velocity) ** 2;
  };
  const convertPermittivityToVelocity = (permittivity: number) => {
    return LIGHT_VELOCITY / Math.sqrt(permittivity);
  };

  const handleVelocityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || Number(v) >= 0) {
      setInternalVelocity(v);
    }
    if (v !== '' || Number(v) > 0) {
      setInternalPermittivity(
        convertVelocityToPermittivity(Number(v)).toString(),
      );
    }
  };

  const handlePermittivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const p = e.target.value;
    if (p === '' || Number(p) >= 0) setInternalPermittivity(p);
    if (p !== '' || Number(p) > 0) {
      setInternalVelocity(convertPermittivityToVelocity(Number(p)).toString());
    }
  };

  const handleVelocityBlur = () => {
    setInternalVelocity(velocity.toString());
    setInternalPermittivity(permittivity.toString());
  };

  const handlePermittivityBlur = () => {
    setInternalVelocity(velocity.toString());
    setInternalPermittivity(permittivity.toString());
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex min-w-0 flex-row gap-2 justify-between">
        <FieldLabel className="shrink-0 w-24" htmlFor="velocity">
          {t('Velocity')}
        </FieldLabel>
        <Input
          id="velocity"
          type="number"
          max={0.3}
          min={0.00000001}
          step="0.005"
          placeholder={t('EnterVelocity')}
          value={internalVelocity}
          onChange={handleVelocityChange}
          onBlur={handleVelocityBlur}
          className="flex-1 max-w-24"
        />
      </div>

      <div className="flex min-w-0 flex-row gap-2 justify-between">
        <FieldLabel className="shrink-0 w-24" htmlFor="permittivity">
          {t('Permittivity')}
        </FieldLabel>
        <Input
          id="permittivity"
          type="number"
          min={1}
          step="1"
          placeholder={t('EnterPermittivity')}
          value={internalPermittivity}
          onChange={handlePermittivityChange}
          onBlur={handlePermittivityBlur}
          className="flex-1 max-w-24"
        />
      </div>
    </div>
  );
}
