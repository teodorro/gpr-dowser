import { Progress } from '@/components/ui/progress';
import useUiStore from '@/stores/ui-store';

export default function ProgressBar() {
  const progress = useUiStore.use.progress();

  console.log(
    progress.length > 0 ? Math.round(Math.max(...progress) * 100) : 0,
  );

  return (
    <Progress
      value={progress.length > 0 ? Math.round(Math.max(...progress) * 100) : 0}
    />
  );
}
