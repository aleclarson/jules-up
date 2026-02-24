import { useEffect, useState } from "preact/hooks";
import { List } from "../types";
import { clickupService } from "../services/clickup";
import { lists, selectedSpaceId, selectedListId, currentView } from "../state";
import styles from "./ListsView.module.css";

export function ListsView() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLists = async () => {
      if (selectedSpaceId.value) {
        setIsLoading(true);
        try {
          lists.value = await clickupService.getLists(selectedSpaceId.value);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchLists();
  }, [selectedSpaceId.value]);

  const selectList = (id: string) => {
    selectedListId.value = id;
    currentView.value = "tasks";
  };

  return (
    <div className={styles.container}>
      <div className={styles.listHeader}>
        <button className={styles.backButton} onClick={() => currentView.value = "spaces"}>
          &larr; Back to Spaces
        </button>
        <h2 style={{ margin: 0 }}>Lists</h2>
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : lists.value.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">∅</div>
          <p>No lists found in this space.</p>
          <button className={styles.actionButton} onClick={() => currentView.value = "spaces"}>Try Another Space</button>
        </div>
      ) : (
        <ul className={styles.listItems}>
          {lists.value.map((list: List) => (
            <li key={list.id} className={styles.listItem} onClick={() => selectList(list.id)}>
              <span className={styles.listName}>{list.name}</span>
              <button className={styles.actionButton}>Select</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
