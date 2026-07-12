import {
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { MenubarContent } from '@/components/ui/menubar';
import { useTranslation } from 'react-i18next';

export default function FileMenu() {
  const { t } = useTranslation();

  return (
    <>
      <MenubarMenu>
        <MenubarTrigger>{t('File')}</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem
              onClick={() => document.getElementById('file-input')?.click()}
            >
              {t('OpenFile')}
            </MenubarItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </>
  );
}
