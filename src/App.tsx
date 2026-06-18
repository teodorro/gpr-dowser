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

function App() {
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
      <div className="flex flex-row flex-1 min-h-0 border-red-500 border-solid border-2">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 border-blue-500 border-solid border-2">
          <ButtonsBar />
          <FileTabs />
          <div className="flex flex-row flex-1 min-w-0 min-h-0 border-green-500 border-solid border-2">
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
