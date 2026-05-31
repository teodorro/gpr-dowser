import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useFileRegistry from "@/stores/file-registry-store";
import { XIcon } from "lucide-react";

type Props = {
  id: string;
  label: string;
};

export default function FileTab({ id, label }: Props) {
  const closeTab = useFileRegistry.use.removeFile();
  const selectedFileId = useFileRegistry.use.selectedFileId();
  const isSelected = id === selectedFileId;

  const getShortLabel = (label: string, maxLength: number) => {
    return label.length > maxLength ? label.slice(0, maxLength) + "..." : label;
  };

  const selectFile = useFileRegistry.use.selectFile();

  return (
    <div
      className={cn(
        "flex items-center rounded-md border border-ring",
        isSelected ? "border-destructive border-2" : "bg-secondary",
      )}
    >
      <Button
        variant="ghost"
        className="border-0"
        onClick={() => {
          selectFile(id);
        }}
      >
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
