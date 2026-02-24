import { useEffect, useState } from "preact/hooks";
import { getTasks, Task } from "../services/clickup";
import { tasks, currentView, activeSession, selectedListId } from "../state";
import { JulesPromptModal } from "./JulesPromptModal";

export function TasksView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    async function fetchTasks() {
      if (selectedListId.value) {
        tasks.value = await getTasks(selectedListId.value);
      }
    }
    fetchTasks();
  }, [selectedListId.value]);

  const handleOpenClickUp = (taskId: string) => {
    console.log(`Opening task ${taskId} in ClickUp`);
    // Mock opening browser
  };

  const handleDelegate = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tasks</h2>
      <button onClick={() => currentView.value = "lists"}>Back to Lists</button>
      <ul>
        {tasks.value.map((task) => (
          <li key={task.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc" }}>
            <div style={{ fontWeight: "bold" }}>{task.name}</div>
            <p>{task.description}</p>
            <div>Status: {task.status.status}</div>
            <div style={{ marginTop: "10px" }}>
              <button onClick={() => handleOpenClickUp(task.id)} style={{ marginRight: "10px" }}>
                Open in ClickUp
              </button>
              {activeSession.value?.taskId === task.id ? (
                <span style={{ fontWeight: "bold", color: "blue" }}>Session Active</span>
              ) : (
                <button onClick={() => handleDelegate(task)}>Delegate to Jules</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {selectedTask && (
        <JulesPromptModal task={selectedTask} onClose={handleCloseModal} />
      )}
    </div>
  );
}
