import { LazyStore } from '@tauri-apps/plugin-store';

export interface SessionState {
  sessionId: string;
  status: string;
}

export interface ActiveJulesSessions {
  [taskId: string]: SessionState;
}

export interface SpaceRepoMappings {
  [spaceId: string]: string;
}

export class StoreService {
  private store: LazyStore;

  constructor() {
    this.store = new LazyStore('app_settings.json');
  }

  async getClickupPat(): Promise<string | null> {
    const val = await this.store.get<string>('clickup_pat');
    return val || null;
  }

  async setClickupPat(pat: string): Promise<void> {
    await this.store.set('clickup_pat', pat);
    await this.store.save();
  }

  async getJulesApiKey(): Promise<string | null> {
    const val = await this.store.get<string>('jules_api_key');
    return val || null;
  }

  async setJulesApiKey(key: string): Promise<void> {
    await this.store.set('jules_api_key', key);
    await this.store.save();
  }

  async getSpaceRepoMappings(): Promise<SpaceRepoMappings> {
    const val = await this.store.get<SpaceRepoMappings>('space_repo_mappings');
    return val || {};
  }

  async setSpaceRepoMapping(spaceId: string, path: string): Promise<void> {
    const mappings = await this.getSpaceRepoMappings();
    mappings[spaceId] = path;
    await this.store.set('space_repo_mappings', mappings);
    await this.store.save();
  }

  async getActiveJulesSessions(): Promise<ActiveJulesSessions> {
    const val = await this.store.get<ActiveJulesSessions>('active_jules_sessions');
    return val || {};
  }

  async setActiveJulesSession(taskId: string, sessionState: SessionState): Promise<void> {
    const sessions = await this.getActiveJulesSessions();
    sessions[taskId] = sessionState;
    await this.store.set('active_jules_sessions', sessions);
    await this.store.save();
  }
}

export const storeService = new StoreService();
