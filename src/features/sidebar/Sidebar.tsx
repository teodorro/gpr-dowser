import { Button } from "@/components/ui/button";
import NavItem from "./NavItem";
import { BookIcon, BotIcon, SettingsIcon, TerminalIcon } from "lucide-react";

const Sidebar = () => {
  return (
    <div className="flex flex-col min-h-0 min-w-sm border-purple-500 border-solid border-2">
      <nav className="flex flex-col flex-1 gap-1 p-2 overflow-y-auto">
        <p className="text-xs text-muted-foreground px-3 pb-1">Processing</p>

        <NavItem icon={<TerminalIcon />} label="Units of measurement">
          <Button>Do smth</Button>
          <a href="#">Starred</a>
          <a href="#">Settings</a>
        </NavItem>

        <NavItem icon={<BotIcon />} label="Processing">
          <a href="#">smth else</a>
          <a href="#">oops</a>
          <a href="#">Settings</a>
        </NavItem>
        <NavItem icon={<BookIcon />} label="Documentation">
          null
        </NavItem>
        <NavItem icon={<SettingsIcon />} label="Settings">
          <a href="#">History</a>
          <a href="#">Starred</a>
          <a href="#">Settings</a>
        </NavItem>
      </nav>
    </div>
  );
};

export default Sidebar;
