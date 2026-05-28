import { Languages } from "./Languages";
import { ThemeToggle } from "./ThemeToggle";

export default function SettingsButtonsBar() {
  return (
    <div className="flex flex-row ">
      <Languages />
      <ThemeToggle />
    </div>
  );
}
