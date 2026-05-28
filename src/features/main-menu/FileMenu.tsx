import {
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { MenubarContent } from "@/components/ui/menubar";
import { useTranslation } from "react-i18next";

export default function FileMenu() {
  const { t } = useTranslation();
  return (
    <MenubarMenu>
      <MenubarTrigger>{t("File")}</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarItem>
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
  );
}
