import { useState } from "preact/hooks";
import { Task } from "../services/clickup";
import { createSession } from "../services/jules";
import { activeSession, repoMappings, selectedSpaceId } from "../state";

interface JulesPromptModalProps {
  task: Task;
  onClose: () => void;
}

export function JulesPromptModal({ task, onClose }: JulesPromptModalProps) {
  const [prompt, setPrompt] = useState(task.description);

  const handleDelegate = async () => {
    const spaceId = selectedSpaceId.value;
    const repoPath = spaceId ? repoMappings.value[spaceId] : null;

    if (!repoPath) {
      alert("No repository mapped for this space. Please map a repo in the Spaces view first.");
      return;
    }

    // 1. Create session
    const session = await createSession(prompt, { taskId: task.id, repoPath });

    // 2. Update active session state
    activeSession.value = {
      sessionId: session.id,
      status: "active",
      taskId: task.id,
    };

    onClose();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      <div style={{
        backgroundColor: "white",
        padding: "20px",
        borderRadius: "8px",
        width: "500px",
      }}>
        <h2>Delegate Task to Jules</h2>
        <p>Task: {task.name}</p>
        <textarea
          style={{ width: "100%", height: "150px" }}
          value={prompt}
          onInput={(e) => setPrompt((e.target as HTMLTextAreaElement).value)}
        />
        <div style={{ marginTop: "10px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={onClose} style={{ marginRight: "10px" }}>Cancel</button>
          <button onClick={handleDelegate}>Delegate</button>
        </div>
      </div>
    </div>
  );
}
