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
import { useState } from "react";

export function Languages() {
  const { t, i18n } = useTranslation();

  const [language, setLanguage] = useState<"en" | "ru">("en");

  const handleChangeLanguage = (language: "en" | "ru") => {
    setLanguage(language);
    i18n.changeLanguage(language);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <GlobeIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={() => handleChangeLanguage("en")}
          className={
            language === "en" ? "bg-primary text-primary-foreground" : ""
          }
        >
          <GB title="United Kingdom" className="h-4 w-6" />
          {t("English")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleChangeLanguage("ru")}
          className={
            language === "ru" ? "bg-primary text-primary-foreground" : ""
          }
        >
          <RU title="Russia" className="h-4 w-6" />
          {t("Russian")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
