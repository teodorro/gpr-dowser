import { Button } from "@/components/ui/button";
import useFileRegistry from "@/stores/file-registry-store";
import { XIcon } from "lucide-react";

type Props = {
  id: string;
  label: string;
};

export default function FileTab({ id, label }: Props) {
  const closeTab = useFileRegistry.use.removeFile();

  const getShortLabel = (label: string, maxLength: number) => {
    return label.length > maxLength ? label.slice(0, maxLength) + "..." : label;
  };
  return (
    <div className="flex items-center bg-secondary rounded-md border border-ring">
      <Button variant="ghost" className="border-0">
        <span className="truncate">{getShortLabel(label, 20)}</span>
      </Button>
      <Button
        variant="ghost"
        className="border-0"
        size="icon"
        onClick={() => {
          closeTab(id);
        }}
      >
        <XIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
