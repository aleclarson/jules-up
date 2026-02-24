import { useEffect, useState } from "preact/hooks";
import { activeSession } from "../state";
import { listActivities } from "../services/jules";
import { checkoutBranch } from "../services/git";

export function SessionControls() {
  const [prReady, setPrReady] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!activeSession.value) return;

    const interval = setInterval(async () => {
      const newActivities = await listActivities(activeSession.value!.sessionId);
      setActivities(newActivities);

      // Check if PR is ready (mock logic)
      if (newActivities.some(a => a.type === 'pr_created')) {
        setPrReady(true);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [activeSession.value]);

  if (!activeSession.value) return null;

  const handlePauseResume = () => {
    // Toggle status locally for now
    activeSession.value = {
      ...activeSession.value!,
      status: activeSession.value!.status === 'active' ? 'paused' : 'active'
    };
  };

  const handleArchive = () => {
    // Stops the agent, clears the local session state, and removes the Jules controls
    activeSession.value = null;
  };

  const handleCheckoutPR = async () => {
    await checkoutBranch("/mock/repo/path", "jules-branch");
    console.log("Checked out PR branch");
  };

  return (
    <div style={{
      position: "fixed",
      bottom: "20px",
      right: "20px",
      backgroundColor: "white",
      padding: "15px",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      width: "300px",
    }}>
      <h3>Active Session</h3>
      <p>Task ID: {activeSession.value.taskId}</p>
      <p>Status: {activeSession.value.status}</p>
      <div style={{ maxHeight: "100px", overflowY: "auto", marginBottom: "10px", fontSize: "12px" }}>
        {activities.map((a, i) => (
          <div key={i}>{a.type}: {a.payload}</div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "5px" }}>
        <button onClick={handlePauseResume}>
          {activeSession.value.status === 'active' ? 'Pause' : 'Resume'}
        </button>
        <button onClick={handleArchive}>Archive</button>
        <button onClick={handleCheckoutPR} disabled={!prReady}>
          Checkout PR
        </button>
      </div>
    </div>
  );
}
