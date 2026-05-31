import { GlobeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GB, RU } from "country-flag-icons/react/3x2";
import { useTranslation } from "react-i18next";

export function Languages() {
  const { t, i18n } = useTranslation();

  const handleChangeLanguage = (language: "en" | "ru") => {
    i18n.changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          className="px-1.5 outline-none focus-visible:outline-none focus-visible:ring-0"
        >
          <GlobeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => handleChangeLanguage("en")}
          className={i18n.language === "en" ? "border border-ring" : ""}
        >
          <GB title="United Kingdom" className="h-4 w-6" />
          {t("English")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleChangeLanguage("ru")}
          className={i18n.language === "ru" ? "border border-ring" : ""}
        >
          <RU title="Russia" className="h-4 w-6" />
          {t("Russian")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
