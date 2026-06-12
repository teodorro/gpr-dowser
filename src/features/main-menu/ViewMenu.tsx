import {
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { PanelLeftIcon, PanelRightIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useUiStore } from "@/stores/ui-store";

export default function ViewMenu() {
  const { t } = useTranslation();

  const { sideBarVisible, setSideBarVisible, aScanVisible, setAScanVisible } =
    useUiStore();

  return (
    <MenubarMenu>
      <MenubarTrigger>{t("View")}</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarItem onClick={() => setSideBarVisible(!sideBarVisible)}>
            <PanelLeftIcon className="w-4 h-4" />
            {sideBarVisible ? t("HideSideBar") : t("ShowSideBar")}
          </MenubarItem>
          <MenubarItem onClick={() => setAScanVisible(!aScanVisible)}>
            <PanelRightIcon className="w-4 h-4" />
            {aScanVisible ? t("HideAScan") : t("ShowAScan")}
          </MenubarItem>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  );
}
