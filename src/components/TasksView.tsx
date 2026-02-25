import { useEffect } from "preact/hooks";
import { openUrl } from "@tauri-apps/plugin-opener";
import { Task } from "../types";
import { clickupService } from "../services/clickup";
import { tasks, selectedListId, activeSession, currentView } from "../state";
import { JulesPromptModal } from "./JulesPromptModal";
import { useState } from "preact/hooks";
import styles from "./TasksView.module.css";

function getTaskGroups(allTasks: Task[]) {
  const openTasks = allTasks.filter((t) => t.status.type !== "closed");

  openTasks.sort((a, b) => {
    const getOrder = (t: Task) => {
      if (!t.priority || !t.priority.orderindex) return Number.MAX_SAFE_INTEGER;
      return parseInt(t.priority.orderindex);
    };
    return getOrder(a) - getOrder(b);
  });

  const groups: { title: string; color: string; tasks: Task[] }[] = [];

  openTasks.forEach((task) => {
    const rawTitle = task.priority?.priority || "No Priority";
    // Capitalize first letter
    const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
    const color = task.priority?.color || "#888";

    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.title === title) {
      lastGroup.tasks.push(task);
    } else {
      groups.push({ title, color, tasks: [task] });
    }
  });

  return groups;
}

export function TasksView() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (title: string) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(title)) {
      newCollapsed.delete(title);
    } else {
      newCollapsed.add(title);
    }
    setCollapsedGroups(newCollapsed);
  };

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

  const groups = getTaskGroups(tasks.value);

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
      ) : groups.length === 0 ? (
        <div className="emptyState">
          <div className="emptyIcon">∅</div>
          <p>No tasks found in this list.</p>
          <button className={styles.backButton} onClick={() => currentView.value = "lists"}>Try Another List</button>
        </div>
      ) : (
        <div>
          {groups.map((group) => (
            <div key={group.title} style={{ marginBottom: '2rem' }}>
              <h3
                className={styles.groupHeader}
                onClick={() => toggleGroup(group.title)}
                style={{
                  color: group.color,
                  borderBottom: `2px solid ${group.color}`,
                  paddingBottom: '0.5rem',
                  marginBottom: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className={`${styles.chevron} ${collapsedGroups.has(group.title) ? styles.collapsed : ''}`}>
                    ▼
                  </span>
                  {group.title}
                </div>
              </h3>
              {!collapsedGroups.has(group.title) && (
                <ul className={styles.taskList}>
                  {group.tasks.map((task) => (
                    <li key={task.id} className={styles.taskItem}>
                      <div className={styles.taskHeader}>
                        <h3 className={styles.taskTitle}>{task.name}</h3>
                        <span className={styles.statusBadge}>{task.status.status}</span>
                      </div>
                      <p className={styles.description}>{task.description || "No description provided."}</p>
                      <div className={styles.taskFooter}>
                        <button className={styles.openButton} onClick={() => openUrl(task.url)}>
                          Open in ClickUp
                        </button>
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
            </div>
          ))}
        </div>
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
