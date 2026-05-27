import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";

type Props = {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
};

export default function NavItem({ icon, label, children }: Props) {
  return (
    <Collapsible>
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
        {icon}
        <span className="flex-1 text-left">{label}</span>
        {children ? (
          <ChevronDown className="size-4" />
        ) : (
          <ChevronRight className="size-4" />
        )}
      </CollapsibleTrigger>
      {children && (
        <CollapsibleContent>
          <div className="border-l ml-5 pl-3 flex flex-col gap-1 mt-1">
            {children}
          </div>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
