import { Progress } from '@/components/ui/progress';
import useUiStore from '@/stores/ui-store';

export default function ProgressBar() {
  const progress = useUiStore.use.progress();
  const transfer = useUiStore.use.transfer();

  const value = transfer
    ? Math.round((transfer.done / transfer.total) * 100)
    : progress.length > 0
      ? Math.round(Math.max(...progress) * 100)
      : 0;

  return <Progress value={value} />;
}
