import {
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { MenubarContent } from "@/components/ui/menubar";
import { useTranslation } from "react-i18next";
import { loadDataFile } from "@/file-parsers/load-data-file";

export default function FileMenu() {
  const { t } = useTranslation();

  const loadFileHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] as File;
    loadDataFile(file);
  };

  return (
    <>
      <input
        id="file-input"
        type="file"
        className="hidden"
        accept=".txt, .geo, .gem"
        onChange={(e) => loadFileHandler(e)}
      />
      <MenubarMenu>
        <MenubarTrigger>{t("File")}</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {t("OpenFile")} <MenubarShortcut>"Ctrl + O"</MenubarShortcut>
            </MenubarItem>
          </MenubarGroup>
          {/* <MenubarSeparator />
          <MenubarGroup>
            <MenubarItem>Share</MenubarItem>
            <MenubarItem>Print</MenubarItem>
          </MenubarGroup> */}
        </MenubarContent>
      </MenubarMenu>
    </>
  );
}
