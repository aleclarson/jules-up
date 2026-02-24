import { load } from "@tauri-apps/plugin-store";

export interface SessionState {
  sessionId: string;
  status: 'active' | 'paused' | 'archived';
  taskId: string;
}

export type SpaceRepoMappings = Record<string, string>;
export type ActiveSessions = Record<string, SessionState>;

const STORE_FILENAME = "app_settings.json";

export class StoreWrapper {
  private storePromise: ReturnType<typeof load>;

  constructor() {
    this.storePromise = load(STORE_FILENAME, { autoSave: true, defaults: {} });
  }

  async getClickUpPAT(): Promise<string> {
    const store = await this.storePromise;
    return (await store.get<string>("clickup_pat")) || "";
  }

  async setClickUpPAT(pat: string): Promise<void> {
    const store = await this.storePromise;
    await store.set("clickup_pat", pat);
  }

  async getJulesAPIKey(): Promise<string> {
    const store = await this.storePromise;
    return (await store.get<string>("jules_api_key")) || "";
  }

  async setJulesAPIKey(key: string): Promise<void> {
    const store = await this.storePromise;
    await store.set("jules_api_key", key);
  }

  async getSpaceRepoMappings(): Promise<SpaceRepoMappings> {
    const store = await this.storePromise;
    return (await store.get<SpaceRepoMappings>("space_repo_mappings")) || {};
  }

  async setSpaceRepoMappings(mappings: SpaceRepoMappings): Promise<void> {
    const store = await this.storePromise;
    await store.set("space_repo_mappings", mappings);
  }

  async getActiveJulesSessions(): Promise<ActiveSessions> {
    const store = await this.storePromise;
    return (await store.get<ActiveSessions>("active_jules_sessions")) || {};
  }

  async setActiveJulesSessions(sessions: ActiveSessions): Promise<void> {
    const store = await this.storePromise;
    await store.set("active_jules_sessions", sessions);
  }

  // Generic methods for backward compatibility if needed by others
  async get<T>(key: string): Promise<T | null> {
    const store = await this.storePromise;
    const value = await store.get<T>(key);
    return value ?? null;
  }

  async set(key: string, value: any): Promise<void> {
    const store = await this.storePromise;
    await store.set(key, value);
  }

  async save(): Promise<void> {
    const store = await this.storePromise;
    await store.save();
  }
}

export const store = new StoreWrapper();
