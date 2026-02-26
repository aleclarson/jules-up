import { signal } from "@preact/signals";
import {
  Space,
  Task,
  List,
  JulesSession,
  SpaceRepoMapping,
  ActiveJulesSessions,
} from "./types";

export type View = "settings" | "tasks" | "welcome";

export const currentView = signal<View>("welcome");

export const spaces = signal<Space[]>([]);

export const selectedSpaceId = signal<string | null>(null);

export const lists = signal<List[]>([]);

export const selectedListId = signal<string | null>(null);

export const tasks = signal<Task[]>([]);

export const settings = signal<{ clickup_pat: string; jules_api_key: string }>({
  clickup_pat: "",
  jules_api_key: "",
});

export const activeSession = signal<JulesSession | null>(null);

export const julesSessions = signal<ActiveJulesSessions>({});

// Mappings: spaceId -> repoPath
export const repoMappings = signal<SpaceRepoMapping>({});

// Mutation functions
export function setCurrentView(view: View) {
  currentView.value = view;
}

export function setSelectedSpaceId(id: string | null) {
  selectedSpaceId.value = id;
}

export function setSelectedListId(id: string | null) {
  selectedListId.value = id;
}

export function setSettings(newSettings: { clickup_pat: string; jules_api_key: string }) {
  settings.value = newSettings;
}

export function setClickUpPat(pat: string) {
  settings.value = { ...settings.value, clickup_pat: pat };
}

export function setJulesApiKey(key: string) {
  settings.value = { ...settings.value, jules_api_key: key };
}

export function setActiveSession(session: JulesSession | null) {
  activeSession.value = session;
}

export function setJulesSessions(sessions: ActiveJulesSessions) {
  julesSessions.value = sessions;
}

export function addJulesSession(session: JulesSession) {
  julesSessions.value = { ...julesSessions.value, [session.taskId]: session };
}

export function setRepoMappings(mappings: SpaceRepoMapping) {
  repoMappings.value = mappings;
}

export function addRepoMapping(spaceId: string, path: string) {
  repoMappings.value = { ...repoMappings.value, [spaceId]: path };
}

export function updateSessionPrLink(taskId: string, prUrl: string) {
  const session = julesSessions.value[taskId];
  if (session) {
    const updatedSession = { ...session, prLink: prUrl };
    julesSessions.value = { ...julesSessions.value, [taskId]: updatedSession };

    // Update activeSession if it matches
    if (activeSession.value?.sessionId === session.sessionId) {
      activeSession.value = { ...activeSession.value, prLink: prUrl };
    }
  }
}
