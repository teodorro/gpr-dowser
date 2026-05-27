import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useTranslation } from "react-i18next";

export default function FileTabs() {
  const { t } = useTranslation();

  // useEffect(() => {
  //   i18n.changeLanguage('en-US');
  // }, []);

  const tabs = [
    { label: t("file_1"), value: "file_1" },
    { label: t("file_2"), value: "file_2" },
    {
      label: t("file_3"),
      value: "file_3",
    },
    {
      label: t("file_4"),
      value: "file_4",
    },
    { label: t("file_5"), value: "file_5" },
  ];

  return (
    <ScrollArea className="w-full rounded-md border whitespace-nowrap ">
      <div className="flex w-max space-x-4 p-1">
        {tabs.map((tab) => (
          <Button key={tab.value} className="w-24 mx-1">
            <span className="truncate">{tab.label}</span>
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
