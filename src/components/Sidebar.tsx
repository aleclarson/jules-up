import { useState } from "preact/hooks";
import { gitService } from "../services/git";
import { storeService } from "../services/store";
import { selectedListId, repoMappings, mapSpaceToRepo, selectList, selectSpace, navigateTo } from "../state";
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
      mapSpaceToRepo(space.id, repoPath);
      // We need to get the latest value for persistence since state updates might be async or batched,
      // but here we can just construct it or read from the updated signal if we trust it's synchronous enough.
      // However, to be safe and cleaner, we should probably let the effect or store service handle it.
      // For now, let's persist the updated map.
      // Since addRepoMapping updates the signal, we can read it back.
      await storeService.setSpaceRepoMappings({ ...repoMappings.value, [space.id]: repoPath });
    }
  };

  const handleSelectList = (listId: string) => {
    selectList(listId);
    selectSpace(space.id);
    navigateTo("tasks");
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
                className={`${styles.listItem} ${selectedListId.value === list.id ? styles.listItemSelected : ''}`}
                onClick={() => handleSelectList(list.id)}
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
          onClick={() => navigateTo("settings")}
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
