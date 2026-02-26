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
