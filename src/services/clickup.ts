export interface Space {
  id: string;
  name: string;
}

export interface List {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: { status: string };
  assignees: { id: number; username: string }[];
}

export async function getSpaces(): Promise<Space[]> {
  console.log('[Mock ClickUp] Fetching spaces');
  return [
    { id: 'space1', name: 'Engineering' },
    { id: 'space2', name: 'Product' },
  ];
}

export async function getLists(spaceId: string): Promise<List[]> {
  console.log(`[Mock ClickUp] Fetching lists for space ${spaceId}`);
  return [
    { id: 'list1', name: 'Sprint 23' },
    { id: 'list2', name: 'Backlog' },
  ];
}

export async function getTasks(listId: string): Promise<Task[]> {
  console.log(`[Mock ClickUp] Fetching tasks for list ${listId}`);
  return [
    {
      id: 'task1',
      name: 'Implement Login',
      description: 'Create a login form with email and password.',
      status: { status: 'to do' },
      assignees: [],
    },
    {
      id: 'task2',
      name: 'Fix Header Bug',
      description: 'Header is misaligned on mobile.',
      status: { status: 'in progress' },
      assignees: [{ id: 123, username: 'Alice' }],
    },
  ];
}

export async function delegateTask(taskId: string, userId: number): Promise<void> {
  console.log(`[Mock ClickUp] Delegating task ${taskId} to user ${userId}`);
  // Simulate API call
}
