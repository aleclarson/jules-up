import { currentView, activeSession } from "./state";
import { SettingsView } from "./components/SettingsView";
import { SpacesView } from "./components/SpacesView";
import { ListsView } from "./components/ListsView";
import { TasksView } from "./components/TasksView";
import { SessionControls } from "./components/SessionControls";

function App() {
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
    </div>
  );
}

export default App;
