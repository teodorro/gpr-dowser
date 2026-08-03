import { Separator } from '@/components/ui/separator';
import DewowInput from './statistical-processing/dewow/DewowInput';
import SavitzkyGolay from './statistical-processing/savitzky-golay/SavitzkyGolay';
import SubtractAvg from './statistical-processing/subtract-avg/SubtractAvg';

export default function Processing() {
  return (
    <div className="flex flex-col gap-2">
      <DewowInput />
      <Separator />
      <SubtractAvg />
      <Separator />
      <SavitzkyGolay />
    </div>
  );
}
