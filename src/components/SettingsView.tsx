import { useState } from "preact/hooks";
import { storeService } from "../services/store";
import { settings, currentView } from "../state";
import styles from "./SettingsView.module.css";

export function SettingsView() {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const saveSettings = async () => {
    await storeService.setClickUpPat(settings.value.clickup_pat);
    await storeService.setJulesApiKey(settings.value.jules_api_key);
    alert("Settings saved!");
    currentView.value = "welcome";
  };

  return (
    <div className={styles.container}>
      <h2>Settings</h2>
      <div className={styles.field}>
        <label className={styles.label}>ClickUp PAT</label>
        <input
          type={focusedField === "clickup_pat" ? "text" : "password"}
          className={styles.input}
          value={settings.value.clickup_pat}
          onInput={(e) =>
            (settings.value = {
              ...settings.value,
              clickup_pat: (e.target as HTMLInputElement).value,
            })
          }
          onFocus={() => setFocusedField("clickup_pat")}
          onBlur={() => setFocusedField(null)}
          placeholder="pk_..."
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Jules API Key</label>
        <input
          type={focusedField === "jules_api_key" ? "text" : "password"}
          className={styles.input}
          value={settings.value.jules_api_key}
          onInput={(e) =>
            (settings.value = {
              ...settings.value,
              jules_api_key: (e.target as HTMLInputElement).value,
            })
          }
          onFocus={() => setFocusedField("jules_api_key")}
          onBlur={() => setFocusedField(null)}
          placeholder="AI..."
        />
      </div>

      <button className={styles.saveButton} onClick={saveSettings}>
        Save and Continue
      </button>
    </div>
  );
}
