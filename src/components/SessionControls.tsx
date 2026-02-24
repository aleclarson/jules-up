import { useEffect, useState } from "preact/hooks";
import { Activity } from "../types";
import { julesService } from "../services/jules";
import { gitService } from "../services/git";
import { activeSession, repoMappings, selectedSpaceId } from "../state";
import styles from "./SessionControls.module.css";

export function SessionControls() {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      if (activeSession.value) {
        const newActivities = await julesService.listActivities(activeSession.value.sessionId);
        setActivities(newActivities);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [activeSession.value]);

  if (!activeSession.value) return null;

  const handleApprove = async () => {
    await julesService.approvePlan(activeSession.value!.sessionId);
  };

  const handleCheckout = async () => {
    const spaceId = selectedSpaceId.value;
    const repoPath = spaceId ? repoMappings.value[spaceId] : null;
    if (repoPath) {
      await gitService.checkoutBranch(repoPath, "jules-branch");
      alert("Checked out branch: jules-branch");
    }
  };

  const handleArchive = () => {
    activeSession.value = null;
  };

  return (
    <div className={styles.container}>
      <h3>Active Jules Session: {activeSession.value.taskId}</h3>
      <p>Status: {activeSession.value.status}</p>

      <div className={styles.activitiesContainer}>
        <h4>Activities</h4>
        {activities.length === 0 && <p>Waiting for Jules...</p>}
        {activities.map((a, i) => (
          <div key={i} className={styles.activityLine}>
            [{new Date(a.timestamp).toLocaleTimeString()}] {a.type}: {JSON.stringify(a.details)}
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button onClick={handleApprove}>Approve Plan</button>
        <button onClick={handleCheckout}>Checkout PR Branch</button>
        <button onClick={handleArchive}>Archive Session</button>
      </div>
    </div>
  );
}
