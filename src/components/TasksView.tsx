import { useEffect } from "preact/hooks";
import { Task } from "../types";
import { clickupService } from "../services/clickup";
import { tasks, selectedListId, activeSession } from "../state";
import { JulesPromptModal } from "./JulesPromptModal";
import { useState } from "preact/hooks";
import styles from "./TasksView.module.css";

export function TasksView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedListId.value) {
        tasks.value = await clickupService.getTasks(selectedListId.value);
      }
    };
    fetchTasks();
  }, [selectedListId.value]);

  return (
    <div>
      <h2>Tasks</h2>
      <ul>
        {tasks.value.map((task) => (
          <li key={task.id} className={styles.taskItem}>
            <strong>{task.name}</strong> ({task.status.status})
            <p>{task.description}</p>
            {activeSession.value?.taskId === task.id ? (
              <span className={styles.workingLabel}>Jules is working on this...</span>
            ) : (
              <button onClick={() => setSelectedTask(task)}>Delegate to Jules</button>
            )}
          </li>
        ))}
      </ul>

      {selectedTask && (
        <JulesPromptModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
