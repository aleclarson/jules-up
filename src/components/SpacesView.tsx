import { useEffect } from "preact/hooks";
import { Space } from "../types";
import { clickupService } from "../services/clickup";
import { gitService } from "../services/git";
import { storeService } from "../services/store";
import { spaces, selectedSpaceId, currentView, repoMappings } from "../state";
import styles from "./SpacesView.module.css";

export function SpacesView() {
  useEffect(() => {
    const fetchSpaces = async () => {
      spaces.value = await clickupService.getSpaces();
    };
    fetchSpaces();
  }, []);

  const handleMapRepo = async (spaceId: string) => {
    const repoPath = await gitService.selectRepoDirectory();
    if (repoPath) {
      repoMappings.value = { ...repoMappings.value, [spaceId]: repoPath };
      await storeService.setSpaceRepoMappings(repoMappings.value);
      await storeService.save();
    }
  };

  const selectSpace = (id: string) => {
    selectedSpaceId.value = id;
    currentView.value = "lists";
  };

  return (
    <div>
      <h2>Spaces</h2>
      <ul>
        {spaces.value.map((space: Space) => (
          <li key={space.id} className={styles.spaceItem}>
            <strong>{space.name}</strong>
            <button className={styles.actionButton} onClick={() => selectSpace(space.id)}>Select</button>
            <button className={styles.actionButton} onClick={() => handleMapRepo(space.id)}>
              {repoMappings.value[space.id] ? "Update Repo" : "Map Repo"}
            </button>
            {repoMappings.value[space.id] && (
              <span className={styles.mappedRepoLabel}>
                Mapped to: {repoMappings.value[space.id]}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
