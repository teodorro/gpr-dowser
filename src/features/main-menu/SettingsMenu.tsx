import {
  MenubarGroup,
  MenubarContent,
  MenubarSubContent,
  MenubarItem,
  MenubarSubTrigger,
  MenubarSub,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { MenubarMenu } from "@/components/ui/menubar";
import { useTranslation } from "react-i18next";
import { useTheme } from "../theme/ThemeContext";

export default function SettingsMenu() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleChangeLanguage = (language: "en" | "ru") => {
    i18n.changeLanguage(language);
  };

  const handleChangeTheme = (theme: "light" | "dark" | "system") => {
    setTheme(theme);
  };

  return (
    <MenubarMenu>
      <MenubarTrigger>{t("Settings")}</MenubarTrigger>
      <MenubarContent>
        <MenubarGroup>
          <MenubarSub>
            <MenubarSubTrigger>{t("Language")}</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarGroup>
                <MenubarItem
                  onClick={() => handleChangeLanguage("en")}
                  className={i18n.language === "en" ? "border border-ring" : ""}
                >
                  {t("English")}
                </MenubarItem>
                <MenubarItem
                  onClick={() => handleChangeLanguage("ru")}
                  className={i18n.language === "ru" ? "border border-ring" : ""}
                >
                  {t("Russian")}
                </MenubarItem>
              </MenubarGroup>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSub>
            <MenubarSubTrigger>{t("Theme")}</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarGroup>
                <MenubarItem
                  onClick={() => handleChangeTheme("dark")}
                  className={theme === "dark" ? "border border-ring" : ""}
                >
                  {t("Dark")}
                </MenubarItem>
                <MenubarItem
                  onClick={() => handleChangeTheme("light")}
                  className={theme === "light" ? "border border-ring" : ""}
                >
                  {t("Light")}
                </MenubarItem>
                <MenubarItem
                  onClick={() => handleChangeTheme("system")}
                  className={theme === "system" ? "border border-ring" : ""}
                >
                  {t("System")}
                </MenubarItem>
              </MenubarGroup>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarGroup>
      </MenubarContent>
    </MenubarMenu>
  );
}
