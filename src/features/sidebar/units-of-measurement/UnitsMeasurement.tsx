import TimeStep from './TimeStep';
import XStep from './XStep';
import Velocity from './Velocity';

export default function UnitsMeasurement() {
  return (
    <div className="flex flex-col gap-2">
      <TimeStep />
      <XStep />
      <Velocity />
    </div>
  );
}
