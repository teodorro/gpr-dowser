import { Button } from "@/components/ui/button";

export default function ButtonsBar() {
  return (
    <div className="flex flex-row gap-2 p-1">
      <Button>Open File</Button>
      <Button>Export File</Button>
    </div>
  );
}
