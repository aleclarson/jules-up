import { useEffect } from "preact/hooks";
import { Task } from "../types";
import { clickupService } from "../services/clickup";
import { tasks, selectedListId, activeSession, currentView } from "../state";
import { JulesPromptModal } from "./JulesPromptModal";
import { useState } from "preact/hooks";
import styles from "./TasksView.module.css";

export function TasksView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedListId.value) {
        setIsLoading(true);
        try {
          tasks.value = await clickupService.getTasks(selectedListId.value);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTasks();
  }, [selectedListId.value]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => currentView.value = "lists"}>
          &larr; Back to Lists
        </button>
        <h2 style={{ margin: 0 }}>Tasks</h2>
      </div>
      
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="loading-spinner"></div>
        </div>
      ) : tasks.value.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">∅</div>
          <p>No tasks found in this list.</p>
          <button className={styles.backButton} onClick={() => currentView.value = "lists"}>Try Another List</button>
        </div>
      ) : (
        <ul className={styles.taskList}>
          {tasks.value.map((task) => (
            <li key={task.id} className={styles.taskItem}>
              <div className={styles.taskHeader}>
                <h3 className={styles.taskTitle}>{task.name}</h3>
                <span className={styles.statusBadge}>{task.status.status}</span>
              </div>
              <p className={styles.description}>{task.description || "No description provided."}</p>
              <div className={styles.taskFooter}>
                {activeSession.value?.taskId === task.id ? (
                  <div className={styles.workingLabel}>Jules is working on this...</div>
                ) : (
                  <button 
                    className={styles.delegateButton} 
                    onClick={() => setSelectedTask(task)}
                  >
                    Delegate to Jules
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {selectedTask && (
        <JulesPromptModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}
