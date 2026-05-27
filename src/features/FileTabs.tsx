import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function FileTabs() {
  const tabs = [
    { label: "File 1", value: "file-1" },
    { label: "File 2", value: "file-2" },
    { label: "File 3 asdf adsf asdf", value: "file-3-eqwrewq-qwer-wqerew" },
    { label: "File 4", value: "file-4" },
    { label: "File 5", value: "file-5" },
  ];
  return (
    <ScrollArea className="w-full rounded-md border whitespace-nowrap ">
      <div className="flex w-max space-x-4 p-1">
        {tabs.map((tab) => (
          <Button key={tab.value} className="w-24 mx-1">
            <span className="truncate">{tab.label}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
