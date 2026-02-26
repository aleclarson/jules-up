import { useEffect } from "preact/hooks";
import { julesSessions, activeSession } from "../state";
import { julesService } from "../services/jules";
import { storeService } from "../services/store";

export function useJulesPoller() {
  useEffect(() => {
    const pollSessions = async () => {
      // Get current sessions
      const currentSessions = julesSessions.value;

      // Identify sessions that need polling
      const tasksToPoll = Object.values(currentSessions).filter(
        (s) => s.status === "active" && !s.prLink,
      );

      if (tasksToPoll.length === 0) return;

      for (const session of tasksToPoll) {
        try {
          const remoteSession = await julesService.getSession(
            session.sessionId,
          );

          // Check for PR link in outputs
          const prUrl = remoteSession.outputs?.pullRequest?.url;
          if (prUrl) {
            // Create updated session object
            const updatedSession = {
              ...session,
              prLink: prUrl,
            };

            // Update state atomically-ish
            // We re-read julesSessions.value to ensure we don't overwrite other changes
            const latestSessions = {
              ...julesSessions.value,
              [session.taskId]: updatedSession,
            };
            julesSessions.value = latestSessions;
            await storeService.setActiveJulesSessions(latestSessions);

            // Update activeSession if it matches
            if (activeSession.value?.sessionId === session.sessionId) {
              activeSession.value = { ...activeSession.value, prLink: prUrl };
            }
          }
        } catch (e) {
          console.error(`Failed to poll session ${session.sessionId}`, e);
        }
      }
    };

    const interval = setInterval(pollSessions, 10000); // Poll every 10 seconds

    // Initial poll (delayed slightly to allow initial load)
    const timeout = setTimeout(pollSessions, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);
}
