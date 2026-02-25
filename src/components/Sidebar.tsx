import { useEffect, useState } from "preact/hooks";
import { clickupService } from "../services/clickup";
import { gitService } from "../services/git";
import { storeService } from "../services/store";
import { spaces, lists, selectedSpaceId, selectedListId, currentView, repoMappings } from "../state";
import styles from "./Sidebar.module.css";

export function Sidebar() {
  const [expandedSpaceId, setExpandedSpaceId] = useState<string | null>(null);
  const [isLoadingSpaces, setIsLoadingSpaces] = useState(false);
  const [isLoadingLists, setIsLoadingLists] = useState(false);

  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoadingSpaces(true);
      try {
        const fetchedSpaces = await clickupService.getSpaces();
        spaces.value = fetchedSpaces;
      } catch (e) {
        console.error("Failed to fetch spaces", e);
      } finally {
        setIsLoadingSpaces(false);
      }
    };
    fetchSpaces();
  }, []);

  const toggleSpace = async (spaceId: string) => {
    if (expandedSpaceId === spaceId) {
      setExpandedSpaceId(null);
      return;
    }

    setExpandedSpaceId(spaceId);
    // Fetch lists for this space
    setIsLoadingLists(true);
    try {
      const fetchedLists = await clickupService.getLists(spaceId);
      lists.value = fetchedLists;
    } catch (e) {
      console.error("Failed to fetch lists", e);
      lists.value = [];
    } finally {
      setIsLoadingLists(false);
    }
  };

  const selectList = (listId: string, spaceId: string) => {
    selectedListId.value = listId;
    selectedSpaceId.value = spaceId;
    currentView.value = "tasks";
  };

  const handleMapRepo = async (spaceId: string, e: Event) => {
    e.stopPropagation();
    const repoPath = await gitService.selectRepoDirectory();
    if (repoPath) {
      repoMappings.value = { ...repoMappings.value, [spaceId]: repoPath };
      await storeService.setSpaceRepoMappings(repoMappings.value);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>Jules</div>

      <div className={styles.spacesList}>
        {isLoadingSpaces ? (
          <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Loading spaces...
          </div>
        ) : (
          spaces.value.map((space) => (
            <div key={space.id} className={styles.spaceItem}>
              <div
                className={styles.spaceHeader}
                onClick={() => toggleSpace(space.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                  <span className={styles.folderIcon}>
                    {expandedSpaceId === space.id ? '📂' : '📁'}
                  </span>
                  <span className={styles.spaceName} title={space.name}>{space.name}</span>
                  {repoMappings.value[space.id] && (
                    <span className={styles.mappedIcon} title={repoMappings.value[space.id]}>
                      ●
                    </span>
                  )}
                </div>
                <button
                  className={styles.mapButton}
                  onClick={(e) => handleMapRepo(space.id, e)}
                  title={repoMappings.value[space.id] || "Map to Git Repo"}
                >
                  {repoMappings.value[space.id] ? "Mapped" : "Map"}
                </button>
              </div>

              {expandedSpaceId === space.id && (
                <div className={styles.lists}>
                  {isLoadingLists ? (
                    <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Loading...
                    </div>
                  ) : lists.value.length === 0 ? (
                    <div style={{ padding: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      No lists
                    </div>
                  ) : (
                    lists.value.map((list) => (
                      <div
                        key={list.id}
                        className={`${styles.listItem} ${selectedListId.value === list.id ? styles.listItemSelected : ''}`}
                        onClick={() => selectList(list.id, space.id)}
                      >
                        {list.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.settingsButton}
          onClick={() => currentView.value = "settings"}
        >
          ⚙️ Settings
        </button>
      </div>
    </div>
  );
}
