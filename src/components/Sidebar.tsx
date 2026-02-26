import { useState } from "preact/hooks";
import { gitService } from "../services/git";
import { storeService } from "../services/store";
import {
  selectedListId,
  selectedSpaceId,
  currentView,
  repoMappings,
} from "../state";
import { useSpaces, useLists } from "../hooks/useClickUp";
import styles from "./Sidebar.module.css";
import { Space } from "../types";

function SpaceItem({ space }: { space: Space }) {
  const [isCollapsed, setIsCollapsed] = useState(false); // Expanded by default
  // Only fetch lists if expanded
  const { lists, isLoading: isLoadingLists } = useLists(
    isCollapsed ? null : space.id,
  );

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const handleMapRepo = async (e: Event) => {
    e.stopPropagation();
    const repoPath = await gitService.selectRepoDirectory();
    if (repoPath) {
      repoMappings.value = { ...repoMappings.value, [space.id]: repoPath };
      await storeService.setSpaceRepoMappings(repoMappings.value);
    }
  };

  const selectList = (listId: string) => {
    selectedListId.value = listId;
    selectedSpaceId.value = space.id;
    currentView.value = "tasks";
  };

  return (
    <div className={styles.spaceItem}>
      <div className={styles.spaceHeader} onClick={toggleCollapse}>
        <div
          style={{ display: "flex", alignItems: "center", overflow: "hidden" }}
        >
          <span className={styles.folderIcon}>{isCollapsed ? "📁" : "📂"}</span>
          <span className={styles.spaceName} title={space.name}>
            {space.name}
          </span>
          {repoMappings.value[space.id] && (
            <span
              className={styles.mappedIcon}
              title={repoMappings.value[space.id]}
            >
              ●
            </span>
          )}
        </div>
        <button
          className={styles.mapButton}
          onClick={handleMapRepo}
          title={repoMappings.value[space.id] || "Map to Git Repo"}
        >
          {repoMappings.value[space.id] ? "Mapped" : "Map"}
        </button>
      </div>

      {!isCollapsed && (
        <div className={styles.lists}>
          {isLoadingLists && lists.length === 0 ? (
            <div
              style={{
                padding: "0.5rem",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              Loading...
            </div>
          ) : lists.length === 0 ? (
            <div
              style={{
                padding: "0.5rem",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
              }}
            >
              No lists
            </div>
          ) : (
            lists.map((list) => (
              <div
                key={list.id}
                className={`${styles.listItem} ${selectedListId.value === list.id ? styles.listItemSelected : ""}`}
                onClick={() => selectList(list.id)}
              >
                {list.name}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { spaces, isLoading: isLoadingSpaces } = useSpaces();

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>Jules</div>

      <div className={styles.spacesList}>
        {isLoadingSpaces && spaces.length === 0 ? (
          <div
            style={{
              padding: "1rem",
              textAlign: "center",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            Loading spaces...
          </div>
        ) : (
          spaces.map((space) => <SpaceItem key={space.id} space={space} />)
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.settingsButton}
          onClick={() => (currentView.value = "settings")}
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
