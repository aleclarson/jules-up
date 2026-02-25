import { useEffect } from "preact/hooks";
import { Task } from "../types";
import { clickupService } from "../services/clickup";
import { tasks, selectedListId, activeSession, currentView, taskPrLinks } from "../state";
import { JulesPromptModal } from "./JulesPromptModal";
import { useState } from "preact/hooks";
import styles from "./TasksView.module.css";
import { openUrl } from "@tauri-apps/plugin-opener";
import { storeService } from "../services/store";

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
  const [editingPrTaskId, setEditingPrTaskId] = useState<string | null>(null);
  const [prLinkInput, setPrLinkInput] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      if (selectedListId.value) {
        setIsLoading(true);
        try {
          tasks.value = await clickupService.getTasks(selectedListId.value);
          taskPrLinks.value = await storeService.getTaskPrLinks();
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTasks();
  }, [selectedListId.value]);

  const handleSavePrLink = async () => {
    if (editingPrTaskId) {
      const newLinks = { ...taskPrLinks.value, [editingPrTaskId]: prLinkInput };
      taskPrLinks.value = newLinks;
      await storeService.setTaskPrLinks(newLinks);
      setEditingPrTaskId(null);
      setPrLinkInput("");
    }
  };

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
              <h3 style={{
                color: group.color,
                borderBottom: `2px solid ${group.color}`,
                paddingBottom: '0.5rem',
                marginBottom: '1rem'
              }}>
                {group.title}
              </h3>
              <ul className={styles.taskList}>
                {group.tasks.map((task) => (
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

                      <div className={styles.prControls}>
                        {editingPrTaskId === task.id ? (
                          <div className={styles.inputContainer}>
                            <input
                              type="text"
                              className={styles.prInput}
                              value={prLinkInput}
                              onInput={(e) => setPrLinkInput(e.currentTarget.value)}
                              placeholder="PR URL"
                            />
                            <button
                              className={styles.saveButton}
                              onClick={handleSavePrLink}
                            >
                              Save
                            </button>
                            <button
                              className={styles.cancelButton}
                              onClick={() => setEditingPrTaskId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : taskPrLinks.value[task.id] ? (
                          <div className={styles.prControls}>
                            <button
                              className={styles.openPrButton}
                              onClick={() => openUrl(taskPrLinks.value[task.id])}
                            >
                              Open PR ↗
                            </button>
                            <button
                              className={styles.editPrButton}
                              onClick={() => {
                                setEditingPrTaskId(task.id);
                                setPrLinkInput(taskPrLinks.value[task.id]);
                              }}
                              title="Edit PR Link"
                            >
                              ✎
                            </button>
                          </div>
                        ) : (
                          <button
                            className={styles.linkPrButton}
                            onClick={() => {
                              setEditingPrTaskId(task.id);
                              setPrLinkInput("");
                            }}
                          >
                            + Link PR
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
