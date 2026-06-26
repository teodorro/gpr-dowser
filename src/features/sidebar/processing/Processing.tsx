import DewowInput from './statistical-processing/dewow/DewowInput';
import SubtractAvg from './statistical-processing/subtract-avg/SubtractAvg';

export default function Processing() {
  return (
    <div className="flex flex-col gap-2">
      <DewowInput />
      <SubtractAvg />
    </div>
  );
}
