import { settings, currentView } from "../state";
import { store } from "../services/store";

export function SettingsView() {
  const handleSave = async () => {
    await store.set("clickup_pat", settings.value.clickup_pat);
    await store.set("jules_api_key", settings.value.jules_api_key);
    await store.save();
    console.log("Settings saved");
    currentView.value = "spaces";
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Settings</h2>
      <div>
        <label>
          ClickUp PAT:
          <input
            type="password"
            value={settings.value.clickup_pat}
            onInput={(e) =>
              (settings.value = { ...settings.value, clickup_pat: (e.target as HTMLInputElement).value })
            }
          />
        </label>
      </div>
      <div>
        <label>
          Jules API Key:
          <input
            type="password"
            value={settings.value.jules_api_key}
            onInput={(e) =>
              (settings.value = { ...settings.value, jules_api_key: (e.target as HTMLInputElement).value })
            }
          />
        </label>
      </div>
      <button onClick={handleSave}>Save & Continue</button>
    </div>
  );
}
