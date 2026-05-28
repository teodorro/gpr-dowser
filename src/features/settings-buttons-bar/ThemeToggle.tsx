import { MoonIcon, SunIcon, MonitorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/features/theme/ThemeContext";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          className="px-1.5 outline-none focus-visible:outline-none focus-visible:ring-0"
        >
          {theme === "dark" ? (
            <MoonIcon />
          ) : theme === "light" ? (
            <SunIcon />
          ) : (
            <MonitorIcon />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={theme === "light" ? "border border-ring" : ""}
        >
          <SunIcon className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={theme === "dark" ? "border border-ring" : ""}
        >
          <MoonIcon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={theme === "system" ? "border border-ring" : ""}
        >
          <MonitorIcon className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
