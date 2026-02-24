export interface SessionState {
  sessionId: string;
  status: 'active' | 'paused' | 'archived';
  taskId: string;
}

export class Store {
  private data: Record<string, any> = {
    clickup_pat: '',
    jules_api_key: '',
    space_repo_mappings: {},
    active_jules_sessions: {},
  };

  constructor(filename: string) {
    console.log(`[Mock Store] Initialized with ${filename}`);
  }

  async get<T>(key: string): Promise<T | null> {
    console.log(`[Mock Store] Get ${key}`);
    return this.data[key] || null;
  }

  async set(key: string, value: any): Promise<void> {
    console.log(`[Mock Store] Set ${key} = ${JSON.stringify(value)}`);
    this.data[key] = value;
  }

  async save(): Promise<void> {
    console.log('[Mock Store] Saved');
  }
}

export const store = new Store("app_settings.json");
