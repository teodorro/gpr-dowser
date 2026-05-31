import { Button } from "@/components/ui/button";
import { loadDataFile } from "@/file-parsers/load-data-file";
import { FolderOpenIcon } from "lucide-react";

export default function ButtonsBar() {
  const loadFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as File;
    loadDataFile(file);
  };

  return (
    <div
      className="flex flex-row gap-2 p-1"
      onClick={() => document.getElementById("file-input")?.click()}
    >
      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".txt, .geo, .gem"
        onChange={(e) => loadFileHandler(e)}
      />
      <Button variant="secondary" size="icon">
        <FolderOpenIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
