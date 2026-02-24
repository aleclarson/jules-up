import { useEffect } from "preact/hooks";
import { getLists } from "../services/clickup";
import { lists, currentView, selectedSpaceId, selectedListId } from "../state";

export function ListsView() {
  useEffect(() => {
    async function fetchLists() {
      if (selectedSpaceId.value) {
        lists.value = await getLists(selectedSpaceId.value);
      }
    }
    fetchLists();
  }, [selectedSpaceId.value]);

  const handleListClick = (listId: string) => {
    selectedListId.value = listId;
    currentView.value = "tasks";
    console.log(`Navigating to tasks for list ${listId}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Lists</h2>
      <button onClick={() => currentView.value = "spaces"}>Back to Spaces</button>
      <ul>
        {lists.value.map((list) => (
          <li key={list.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
            <div onClick={() => handleListClick(list.id)} style={{ cursor: "pointer", fontWeight: "bold" }}>
              {list.name}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
