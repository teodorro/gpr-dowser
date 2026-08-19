import './App.css';
import MainMenu from './features/main-menu/MainMenu';
import FileTabs from './features/file-tabs/FileTabs';
import Sidebar from './features/sidebar/Sidebar';
import ButtonsBar from './features/buttons-bar/ButtonsBar';
import BScanStatusBar from './features/b-scan/BScanStatusBar';
import AScan from './features/a-scan/AScan';
import BScan from './features/b-scan/BScan';
import SettingsButtonsBar from './features/settings-buttons-bar/SettingsButtonsBar';
import { Toaster } from '@/components/ui/sonner';
import { loadFileHandler } from './features/main-menu/shared-handlers';
import useFileRegistryStore from './stores/file-registry-store';
import { loadDataFile } from './file-parsers/load-data-file';
import { useEffect } from 'react';
import { toast } from 'sonner';
import CmpSemblance from './features/cmp/CmpSemblance';
import useUiStore from './stores/ui-store';
import AScanToolbar from './features/a-scan/AScanToolbar';
import CmpLayersTable from './features/sidebar/сmp/CmpLayersTable';
import { Button } from './components/ui/button';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import ProgressBar from './features/progress-bar/ProgressBar';

function App() {
  const fileIds = useFileRegistryStore.use.fileIds();
  const cmpMode = useUiStore.use.cmpMode();
  const aScanVisible = useUiStore.use.aScanVisible();
  const cmpTableVisible = useUiStore.use.cmpTableVisible();
  const setCmpTableVisible = useUiStore.use.setCmpTableVisible();

  useEffect(() => {
    const loadExample = async () => {
      const name = 'cmp-731.gem';
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
      <div className="flex flex-row flex-1 min-h-0 gap-2 p-1">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 gap-1">
          <ButtonsBar />
          <ProgressBar />
          {fileIds.length > 0 && <FileTabs />}
          <div className="flex flex-row flex-1 min-w-0 min-h-0 gap-2">
            <div className="flex flex-col flex-1 min-w-0 min-h-0 gap-1">
              <BScan />
              <BScanStatusBar />
            </div>
            {cmpMode && (
              <div className="flex flex-col flex-1 min-w-0 min-h-0 gap-1">
                <div className="relative flex flex-1 min-w-0 min-h-0">
                  <CmpSemblance />
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute bottom-0 right-0 z-10"
                    onClick={() => setCmpTableVisible(!cmpTableVisible)}
                  >
                    {cmpTableVisible ? <ArrowDownIcon /> : <ArrowUpIcon />}
                  </Button>
                </div>
                {cmpTableVisible && (
                  <div className="flex flex-col h-50 shrink-0 min-w-0 min-h-0 gap-1">
                    <CmpLayersTable />
                  </div>
                )}
              </div>
            )}
            {aScanVisible && (
              <div className="relative flex flex-col w-[14rem] shrink-0 min-h-0 gap-1">
                <AScan />
                <AScanToolbar />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
