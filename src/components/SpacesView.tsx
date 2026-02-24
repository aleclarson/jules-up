import { useEffect, useState } from "preact/hooks";
import { Space } from "../types";
import { clickupService } from "../services/clickup";
import { gitService } from "../services/git";
import { storeService } from "../services/store";
import { spaces, selectedSpaceId, currentView, repoMappings } from "../state";
import styles from "./SpacesView.module.css";

export function SpacesView() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoading(true);
      try {
        spaces.value = await clickupService.getSpaces();
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSpaces();
  }, []);

  const handleMapRepo = async (spaceId: string) => {
    const repoPath = await gitService.selectRepoDirectory();
    if (repoPath) {
      repoMappings.value = { ...repoMappings.value, [spaceId]: repoPath };
      await storeService.setSpaceRepoMappings(repoMappings.value);
    }
  };

  const selectSpace = (id: string) => {
    selectedSpaceId.value = id;
    currentView.value = "lists";
  };

  return (
    <div className={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Spaces</h2>
        <button
          className={styles.actionButton}
          onClick={() => currentView.value = "settings"}
          style={{ background: 'transparent', color: 'var(--text-secondary)' }}
        >
          Settings
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : spaces.value.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">∅</div>
          <p>No spaces found in your ClickUp account.</p>
          <button className={styles.actionButton} onClick={() => currentView.value = "settings"}>Check API Settings</button>
        </div>
      ) : (
        <ul className={styles.spaceList}>
          {spaces.value.map((space: Space) => (
            <li key={space.id} className={styles.spaceItem}>
              <div className={styles.spaceInfo}>
                <div className={styles.spaceName}>
                  {space.name}
                  {repoMappings.value[space.id] && (
                    <span className={styles.mappedRepoLabel}>
                      Mapped
                    </span>
                  )}
                </div>
                {repoMappings.value[space.id] && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {repoMappings.value[space.id]}
                  </div>
                )}
              </div>
              <div className={styles.actions}>
                <button className={styles.actionButton} onClick={() => selectSpace(space.id)}>Select</button>
                <button className={styles.actionButton} onClick={() => handleMapRepo(space.id)}>
                  {repoMappings.value[space.id] ? "Update Repo" : "Map Repo"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
