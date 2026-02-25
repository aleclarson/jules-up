import { useEffect, useState } from "preact/hooks";
import { currentView, activeSession, settings, repoMappings } from "./state";
import { SettingsView } from "./components/SettingsView";
import { TasksView } from "./components/TasksView";
import { SessionControls } from "./components/SessionControls";
import { Sidebar } from "./components/Sidebar";
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
        currentView.value = "welcome";
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
      case "tasks":
        return <TasksView />;
      case "welcome":
      default:
        return (
          <div className="emptyState" style={{ height: '100%', border: 'none', background: 'transparent' }}>
             <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👋</div>
             <h2>Welcome to Jules Desktop</h2>
             <p>Select a list from the sidebar to view tasks.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', position: 'relative' }}>
        {renderView()}
        {activeSession.value && <SessionControls />}
        {showToast && (
          <div className="toast">
            <span style={{ color: 'var(--accent-color)' }}>✦</span> Welcome back
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
