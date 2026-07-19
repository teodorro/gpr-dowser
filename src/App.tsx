import './App.css';
import MainMenu from './features/main-menu/MainMenu';
import FileTabs from './features/file-tabs/FileTabs';
import Sidebar from './features/sidebar/Sidebar';
import ButtonsBar from './features/buttons-bar/ButtonsBar';
import StatusBar from './features/StatusBar';
import AScan from './features/AScan';
import BScan from './features/b-scan/BScan';
import SettingsButtonsBar from './features/settings-buttons-bar/SettingsButtonsBar';
import { Toaster } from '@/components/ui/sonner';
import { loadFileHandler } from './features/main-menu/shared-handlers';
import useFileRegistryStore from './stores/file-registry-store';
import { loadDataFile } from './file-parsers/load-data-file';
import { useEffect } from 'react';
import { toast } from 'sonner';

function App() {
  const fileIds = useFileRegistryStore.use.fileIds();

  useEffect(() => {
    const loadExample = async () => {
      const name = 'river-ВБ_13_1.gem';
      const url = `${import.meta.env.BASE_URL}data-examples/loza/${encodeURIComponent(name)}`;
      const res = await fetch(url);
      if (!res.ok) {
        toast.error(`Failed to load ${url}: ${res.status}`);
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], name, { type: blob.type });
      loadDataFile(file);
    };
    void loadExample();
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <input
        id="file-input"
        type="file"
        multiple
        className="hidden"
        accept=".txt, .geo, .gem"
        onChange={(e) => loadFileHandler(e)}
      />
      <div className="flex flex-row gap-2 justify-between">
        <MainMenu />
        <SettingsButtonsBar />
      </div>

      <Toaster />
      <div className="flex flex-row flex-1 min-h-0 gap-2 p-2">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 gap-2">
          <ButtonsBar />
          {fileIds.length > 0 && <FileTabs />}
          <div className="flex flex-row flex-1 min-w-0 min-h-0 gap-2">
            <BScan />
            <AScan />
          </div>
          <StatusBar />
        </div>
      </div>
    </div>
  );
}

export default App;
