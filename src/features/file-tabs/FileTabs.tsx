import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import useFileRegistry from "@/stores/file-registry-store";
import { useMemo } from "react";
import FileTab from "./FileTab";
import { dataSliceStores } from "@/stores/data-slice-stores";

export default function FileTabs() {
  const fileIds = useFileRegistry.use.fileIds();

  const tabs = useMemo(() => {
    const vals = fileIds.map((id) => ({
      id,
      label: dataSliceStores.get(id)?.getState().name ?? "",
    }));
    return vals;
  }, [fileIds]);

  return (
    <ScrollArea className="w-full rounded-md border whitespace-nowrap ">
      <div className="flex w-max space-x-1 p-1">
        {tabs.map((tab) => (
          <FileTab key={tab.id} id={tab.id} label={tab.label} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
