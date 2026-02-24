export interface Session {
  id: string;
  status: string;
}

export interface Activity {
  type: string;
  payload: any;
}

export async function createSession(prompt: string, _sourceContext: any): Promise<Session> {
  console.log('[Mock Jules] Creating session with prompt:', prompt);
  return { id: 'session-123', status: 'created' };
}

export async function sendMessage(sessionId: string, message: string): Promise<void> {
  console.log(`[Mock Jules] Sending message to session ${sessionId}: ${message}`);
}

export async function listActivities(sessionId: string): Promise<Activity[]> {
  console.log(`[Mock Jules] Listing activities for session ${sessionId}`);
  return [
    { type: 'message', payload: 'Analyzing request...' },
    { type: 'plan', payload: 'Plan proposed.' },
  ];
}

export async function approvePlan(sessionId: string): Promise<void> {
  console.log(`[Mock Jules] Approving plan for session ${sessionId}`);
}
