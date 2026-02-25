import { useEffect, useState } from "preact/hooks";
import { currentView, activeSession, settings, repoMappings } from "./state";
import { SettingsView } from "./components/SettingsView";
import { SpacesView } from "./components/SpacesView";
import { ListsView } from "./components/ListsView";
import { TasksView } from "./components/TasksView";
import { SessionControls } from "./components/SessionControls";
import { storeService } from "./services/store";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const init = async () => {
      const pat = await storeService.getClickUpPat();
      const apiKey = await storeService.getJulesApiKey();
      const mappings = await storeService.getSpaceRepoMappings();

      settings.value = {
        clickup_pat: pat || "",
        jules_api_key: apiKey || "",
      };
      repoMappings.value = mappings;

      if (pat && apiKey) {
        currentView.value = "spaces";
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
      } else {
        currentView.value = "settings";
      }
      setIsInitialized(true);
    };
    init();
  }, []);

  if (!isInitialized) {
    return (
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const renderView = () => {
    switch (currentView.value) {
      case "settings":
        return <SettingsView />;
      case "spaces":
        return <SpacesView />;
      case "lists":
        return <ListsView />;
      case "tasks":
        return <TasksView />;
      default:
        return <SettingsView />;
    }
  };

  return (
    <div className="container">
      <h1>Jules Desktop</h1>
      {renderView()}
      {activeSession.value && <SessionControls />}
      {showToast && (
        <div className="toast">
          <span style={{ color: 'var(--accent-color)' }}>✦</span> Welcome back
        </div>
      )}
    </div>
  );
}

export default App;
