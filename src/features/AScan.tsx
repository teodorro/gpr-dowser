import { useUiStore } from "@/stores/ui-store";

export default function AScan() {
  const { aScanVisible } = useUiStore();

  if (!aScanVisible) return null;

  return (
    <div className="flex flex-col w-2xs border-pink-500 border-solid border-2">
      AScan
    </div>
  );
}
