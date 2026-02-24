import { useEffect } from "preact/hooks";
import { getSpaces } from "../services/clickup";
import { selectRepoDirectory } from "../services/git";
import { spaces, repoMappings, currentView } from "../state";
import { store } from "../services/store";

export function SpacesView() {
  useEffect(() => {
    async function fetchSpaces() {
      spaces.value = await getSpaces();
    }
    fetchSpaces();
  }, []);

  const handleSelectRepo = async (spaceId: string) => {
    const repoPath = await selectRepoDirectory();
    if (repoPath) {
      repoMappings.value = { ...repoMappings.value, [spaceId]: repoPath };
      await store.set("space_repo_mappings", repoMappings.value);
      await store.save();
    }
  };

  const handleSpaceClick = (spaceId: string) => {
    currentView.value = "tasks";
    // In a real app, you would pass the spaceId to load the correct tasks
    console.log(`Navigating to tasks for space ${spaceId}`);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Spaces</h2>
      <button onClick={() => currentView.value = "settings"}>Back to Settings</button>
      <ul>
        {spaces.value.map((space) => (
          <li key={space.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
            <div onClick={() => handleSpaceClick(space.id)} style={{ cursor: "pointer", fontWeight: "bold" }}>
              {space.name}
            </div>
            <div>
              Mapped Repo: {repoMappings.value[space.id] || "None"}
              <button onClick={() => handleSelectRepo(space.id)} style={{ marginLeft: "10px" }}>
                Select Repo
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
