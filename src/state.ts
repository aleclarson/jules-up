import { signal } from "@preact/signals";
import { Space, Task, List } from "./services/clickup";
import { SessionState } from "./services/store";

export type View = "settings" | "spaces" | "lists" | "tasks";

export const currentView = signal<View>("settings");

export const spaces = signal<Space[]>([]);

export const selectedSpaceId = signal<string | null>(null);

export const lists = signal<List[]>([]);

export const selectedListId = signal<string | null>(null);

export const tasks = signal<Task[]>([]);

export const settings = signal<{ clickup_pat: string; jules_api_key: string }>({
  clickup_pat: "",
  jules_api_key: "",
});

export const activeSession = signal<SessionState | null>(null);

// Mappings: spaceId -> repoPath
export const repoMappings = signal<Record<string, string>>({});
