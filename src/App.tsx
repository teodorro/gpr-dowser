import "./App.css";
import MainMenu from "./features/MainMenu";
import FileTabs from "./features/FileTabs";
import Sidebar from "./features/sidebar/Sidebar";
import ButtonsBar from "./features/ButtonsBar";
import StatusBar from "./features/StatusBar";
import AScan from "./features/AScan";
import BScan from "./features/BScan";

function App() {
  return (
    <div className="flex flex-col h-screen">
      <MainMenu />

      <div className="flex flex-row flex-1 min-h-0 border-red-500 border-solid border-2">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0 border-blue-500 border-solid border-2">
          <ButtonsBar />
          <FileTabs />
          <div className="flex flex-row flex-1 border-green-500 border-solid border-2">
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
