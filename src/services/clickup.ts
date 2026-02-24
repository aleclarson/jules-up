import { fetch } from "@tauri-apps/plugin-http";
import { storeService } from "./store";
import { Space, List, Task, User } from "../types";
export type { Space, List, Task, User };

const API_BASE = "https://api.clickup.com/api/v2";

export class ClickUpService {
  private async getHeaders(): Promise<HeadersInit> {
    const pat = await storeService.getClickUpPat();
    if (!pat) throw new Error("ClickUp PAT not configured");
    return {
      "Authorization": pat,
      "Content-Type": "application/json",
    };
  }

  async getUser(): Promise<User> {
    const response = await fetch(`${API_BASE}/user`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch user: ${response.statusText}`);
    const data = await response.json();
    return data.user;
  }

  async getTeams(): Promise<any[]> {
    const response = await fetch(`${API_BASE}/team`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch teams: ${response.statusText}`);
    const data = await response.json();
    return data.teams;
  }

  async getSpaces(): Promise<Space[]> {
    const teams = await this.getTeams();
    let allSpaces: Space[] = [];

    for (const team of teams) {
      const response = await fetch(`${API_BASE}/team/${team.id}/space?archived=false`, {
        method: 'GET',
        headers: await this.getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        allSpaces = allSpaces.concat(data.spaces);
      }
    }
    return allSpaces;
  }

  async getLists(spaceId: string): Promise<List[]> {
    const headers = await this.getHeaders();
    let lists: List[] = [];

    // 1. Fetch folderless lists
    const listsResponse = await fetch(`${API_BASE}/space/${spaceId}/list?archived=false`, {
      method: 'GET',
      headers,
    });
    if (listsResponse.ok) {
      const data = await listsResponse.json();
      lists = lists.concat(data.lists);
    }

    // 2. Fetch folders and their lists
    const foldersResponse = await fetch(`${API_BASE}/space/${spaceId}/folder?archived=false`, {
      method: 'GET',
      headers,
    });
    if (foldersResponse.ok) {
      const data = await foldersResponse.json();
      for (const folder of data.folders) {
        if (folder.lists) {
            lists = lists.concat(folder.lists);
        }
      }
    }

    return lists;
  }

  async getTasks(listId: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/list/${listId}/task?archived=false`, {
      method: 'GET',
      headers: await this.getHeaders(),
    });
    if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    const data = await response.json();
    return data.tasks;
  }

  async delegateTask(taskId: string, userId: string): Promise<void> {
    const headers = await this.getHeaders();
    const userIdNum = parseInt(userId);

    // Update status and add assignee
    const response = await fetch(`${API_BASE}/task/${taskId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({
        status: "in progress",
        assignees: {
          add: [userIdNum]
        }
      }),
    });

    if (!response.ok) {
        throw new Error(`Failed to delegate task: ${response.statusText}`);
    }
  }
}

export const clickupService = new ClickUpService();

// Exported functions for UI compatibility
export const getSpaces = () => clickupService.getSpaces();
export const getLists = (spaceId: string) => clickupService.getLists(spaceId);
export const getTasks = (listId: string) => clickupService.getTasks(listId);
export const delegateTask = (taskId: string, userId: string) => clickupService.delegateTask(taskId, userId);
