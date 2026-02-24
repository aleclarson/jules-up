import { useEffect } from "preact/hooks";
import { List } from "../types";
import { clickupService } from "../services/clickup";
import { lists, selectedSpaceId, selectedListId, currentView } from "../state";

export function ListsView() {
  useEffect(() => {
    const fetchLists = async () => {
      if (selectedSpaceId.value) {
        lists.value = await clickupService.getLists(selectedSpaceId.value);
      }
    };
    fetchLists();
  }, [selectedSpaceId.value]);

  const selectList = (id: string) => {
    selectedListId.value = id;
    currentView.value = "tasks";
  };

  return (
    <div>
      <button onClick={() => currentView.value = "spaces"}>Back to Spaces</button>
      <h2>Lists</h2>
      <ul>
        {lists.value.map((list: List) => (
          <li key={list.id}>
            {list.name}
            <button onClick={() => selectList(list.id)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
