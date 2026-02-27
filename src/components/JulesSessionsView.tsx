import { useState, useMemo } from "preact/hooks";
import useSWR from "swr";
import { julesSessions, repoMappings } from "../state";
import { clickupService } from "../services/clickup";
import { gitService } from "../services/git";
import { storeService } from "../services/store";
import { Task, JulesSession } from "../types";
import styles from "./JulesSessionsView.module.css";

// Helper to fetch additional session details
const fetchSessionDetails = async (session: JulesSession) => {
  let task: Task | null = null;
  let prStatus: string | null = null;

  try {
    task = await clickupService.getTask(session.taskId);
  } catch (e) {
    console.error(`Failed to fetch task ${session.taskId}`, e);
  }

  if (session.prLink && session.repoPath) {
    try {
        // Only verify PR status if we have a repo path
        // We might need to ensure the repo path is valid, but the command will fail if not.
        // Also, this relies on `gh` being authenticated.
        prStatus = await gitService.getPrStatus(session.repoPath, session.prLink);
    } catch (e) {
        console.warn(`Failed to fetch PR status for ${session.prLink}`, e);
        // Default to OPEN or unknown if check fails to ensure it shows up in the list rather than hidden?
        // Logic says: show if !closed && !merged. If error, assume it's still relevant.
        prStatus = "UNKNOWN";
    }
  }

  // Cast task.list to include optional space_id which might come from API but is not in strict type
  // Or handle null spaceId.
  const spaceId = (task?.list as any)?.space_id || null;

  return { ...session, taskName: task?.name || "Unknown Task", prStatus, spaceId };
};

function useSessionDetails() {
    const sessions = julesSessions.value;
    const sessionIds = Object.keys(sessions);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    const { data, error, isLoading, isValidating } = useSWR(
        ['jules-session-details', ...sessionIds], // Re-fetch when session keys change
        async () => {
            const sessionList = Object.values(sessions);
            const results = [];

            // Limit concurrency to 5
            for (let i = 0; i < sessionList.length; i += 5) {
                const chunk = sessionList.slice(i, i + 5);
                const chunkResults = await Promise.all(chunk.map(fetchSessionDetails));
                results.push(...chunkResults);
            }
            return results;
        },
        {
            refreshInterval: 10000, // Refresh every 10s
            revalidateOnFocus: true,
            onSuccess: () => setLastRefreshed(new Date())
        }
    );

    return {
        detailedSessions: data || [],
        isLoading,
        isValidating,
        lastRefreshed,
        isError: error
    };
}

export function JulesSessionsView() {
    const { detailedSessions, isLoading, isValidating, lastRefreshed } = useSessionDetails();

    // Filter sessions
    const filteredSessions = useMemo(() => {
        return detailedSessions.filter(s => {
            if (!s.prLink) return true; // Show if no PR yet
            // Show if PR is not closed or merged
            const status = s.prStatus?.toUpperCase();
            return status !== 'MERGED' && status !== 'CLOSED';
        });
    }, [detailedSessions]);

    const handleOpen = async (session: any) => {
        if (!session.repoPath) {
             alert("Repository path is missing for this session.");
             await mapRepoForSession(session);
             return;
        }

        // Check if path exists/is valid? gitService commands will fail if not.
        try {
            await gitService.openInIde(session.repoPath);
            if (session.prLink) {
                await gitService.checkoutPr(session.repoPath, session.prLink);
            }
        } catch (e) {
            console.error("Failed to open/checkout", e);
            const retry = confirm("Failed to open repository. The path might be invalid. Do you want to remap it?");
            if (retry) {
                await mapRepoForSession(session);
            }
        }
    };

    const mapRepoForSession = async (session: any) => {
         const selected = await gitService.selectRepoDirectory();
         if (selected) {
             // 1. Update session in store and state
             const updatedSession = { ...julesSessions.value[session.taskId], repoPath: selected };
             const newSessions = { ...julesSessions.value, [session.taskId]: updatedSession };

             julesSessions.value = newSessions;
             await storeService.setActiveJulesSessions(newSessions);

             // 2. Update global repoMappings if spaceId is available
             // session object here comes from filteredSessions which has data from fetchSessionDetails, so it should have spaceId
             if (session.spaceId) {
                 const newMappings = { ...repoMappings.value, [session.spaceId]: selected };
                 repoMappings.value = newMappings;
                 await storeService.setSpaceRepoMappings(newMappings);
             }

             // Retry open
             handleOpen({ ...session, repoPath: selected });
         }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Jules Sessions</h2>
            <div className={styles.subtitle}>
                Managing {filteredSessions.length} active sessions
                {lastRefreshed && (
                    <span style={{ marginLeft: '1rem', fontSize: '0.8rem', opacity: 0.8 }}>
                        Last refreshed: {lastRefreshed.toLocaleTimeString()}
                        {isValidating && " (Refreshing...)"}
                    </span>
                )}
            </div>

            {isLoading && filteredSessions.length === 0 ? (
                 <div className="loading-spinner"></div>
            ) : filteredSessions.length === 0 ? (
                <div className="emptyState">
                    <p>No active sessions requiring attention.</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredSessions.map(session => (
                        <div key={session.sessionId} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <span className={styles.taskName} title={session.taskName}>{session.taskName}</span>
                                <span className={`${styles.statusBadge} ${styles[session.status]}`}>
                                    {session.status}
                                </span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>PR:</span>
                                    {session.prLink ? (
                                        <span className={styles.value}>
                                            <a href={session.prLink} target="_blank" rel="noreferrer">{session.prLink.split('/').pop()}</a>
                                            {session.prStatus && <span className={styles.prStatus}> ({session.prStatus})</span>}
                                        </span>
                                    ) : (
                                        <span className={styles.value}>Not created</span>
                                    )}
                                </div>
                                <div className={styles.infoRow}>
                                    <span className={styles.label}>Repo:</span>
                                    <span className={styles.value} title={session.repoPath || "Not mapped"}>
                                        {session.repoPath ? session.repoPath.split(/[/\\]/).pop() : "⚠️ Not mapped"}
                                    </span>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <button
                                    className={styles.openButton}
                                    onClick={() => handleOpen(session)}
                                >
                                    {session.repoPath ? "Open & Checkout" : "Map & Open"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
