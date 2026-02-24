import { storeService } from "../services/store";
import { settings, currentView } from "../state";
import styles from "./SettingsView.module.css";

export function SettingsView() {
  const saveSettings = async () => {
    await storeService.setClickUpPat(settings.value.clickup_pat);
    await storeService.setJulesApiKey(settings.value.jules_api_key);
    await storeService.save();
    alert("Settings saved!");
    currentView.value = "spaces";
  };

  return (
    <div className={styles.container}>
      <h2>Settings</h2>
      <div className={styles.field}>
        <label className={styles.label}>ClickUp PAT</label>
        <input
          type="password"
          className={styles.input}
          value={settings.value.clickup_pat}
          onInput={(e) => settings.value = { ...settings.value, clickup_pat: (e.target as HTMLInputElement).value }}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Jules API Key</label>
        <input
          type="password"
          className={styles.input}
          value={settings.value.jules_api_key}
          onInput={(e) => settings.value = { ...settings.value, jules_api_key: (e.target as HTMLInputElement).value }}
        />
      </div>

      <button onClick={saveSettings}>Save and Continue</button>
    </div>
  );
}
