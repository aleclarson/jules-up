# Tauri Implementation Plan (JS/TS Focused)

## 1. Technology Stack

- **Framework**: Tauri 2.0
- **Frontend logic & UI**: React, TypeScript, Tailwind CSS, shadcn/ui.
- **ClickUp APIs**: `@tauri-apps/plugin-http` (provides a drop-in replacement for standard `fetch()` that executes natively to bypass browser CORS restrictions).
- **Local Storage**: `@tauri-apps/plugin-store` (for JS-driven JSON persistence).
- **Git & System Execution**: `@tauri-apps/plugin-shell` (to execute local `git` commands directly from TypeScript).
- **File System / Pickers**: `@tauri-apps/plugin-dialog` (for selecting Git repo folders).
- **Rust Backend**: Treated strictly as a host. **Zero custom Rust code** will be written; we will rely entirely on configuring Tauri capabilities (JSON).

## 2. Architecture Overview

We will use a "Thick Client / Frontend-Heavy" architecture. React/TypeScript will orchestrate the entire workflow. Instead of writing custom Rust bindings via Tauri Commands (`invoke`), the frontend will use Tauri's official JS APIs to interact with the OS.

- **Data layer**: Managed via Zustand or React Context.
- **Service layer**: Plain TypeScript classes/functions utilizing Tauri plugins.

## 3. Phase-by-Phase Implementation

### Phase 1: Project Setup & Tauri Configuration

1.  **Initialize**: Run `create-tauri-app` (React + TypeScript).
2.  **Install Tauri Plugins**:
    ```bash
    npm install @tauri-apps/plugin-store @tauri-apps/plugin-http @tauri-apps/plugin-shell @tauri-apps/plugin-dialog
    ```
3.  **Configure Capabilities (`src-tauri/capabilities/default.json`)**:
    - **HTTP**: Allow requests to `https://api.clickup.com/*`.
    - **Shell**: Expose the `git` and `jules` (if Jules uses a CLI) executables.
    - **Dialog & Store**: Grant read/write access to the AppData folder for the `.json` store.

### Phase 2: Persistence Setup (TypeScript)

Create `src/services/store.ts`.

1.  Initialize the store using `@tauri-apps/plugin-store`:
    ```typescript
    import { Store } from "@tauri-apps/plugin-store";
    const store = new Store("app_settings.json");
    ```
2.  Create helper functions to `get` and `set` the three main data pillars:
    - `clickup_pat` (string)
    - `space_repo_mappings` (Record<string, string>)
    - `active_jules_sessions` (Record<string, SessionState>)

### Phase 3: ClickUp Integration (TypeScript)

Create `src/services/clickup.ts`. Use Tauri's HTTP plugin `fetch` to avoid WebView CORS issues.

1.  **Setup Fetch**:
    ```typescript
    import { fetch } from "@tauri-apps/plugin-http";
    ```
2.  **API Methods**:
    - `getSpaces()`: `fetch('https://api.clickup.com/api/v2/team/...')`
    - `getLists(spaceId)`: Fetch folders/lists.
    - `getTasks(listId)`: Fetch active tasks.
    - `delegateTask(taskId, userId)`:
      - `fetch` (PUT) to update status to "In Progress".
      - `fetch` (PUT/POST) to add `userId` to task assignees.

### Phase 4: Git Integration (TypeScript)

Create `src/services/git.ts`. Use Tauri's Shell plugin to run Git commands directly.

1.  **Select Directory**: Use `@tauri-apps/plugin-dialog` (`open({ directory: true })`) to let the user pick the Git repo path, saving the result to the Tauri Store.
2.  **Execute Git Commands**:

    ```typescript
    import { Command } from "@tauri-apps/plugin-shell";

    export async function checkoutBranch(repoPath: string, branchName: string) {
      // Run: git fetch origin
      const fetchCmd = Command.create("git", ["fetch", "origin"], {
        cwd: repoPath,
      });
      await fetchCmd.execute();

      // Run: git checkout <branchName>
      const checkoutCmd = Command.create("git", ["checkout", branchName], {
        cwd: repoPath,
      });
      await checkoutCmd.execute();
    }
    ```

### Phase 5: Jules Integration Layer (TypeScript)

Create `src/services/jules.ts`.

- _If Jules is an API_: Use Tauri's `fetch()` to initiate the session.
- _If Jules is a CLI tool_: Use the `Command` API (like the Git integration) to run Jules in the background.

1.  **Methods**:
    - `startSession(repoPath, taskId, prompt)`: Calls Jules, returns a `sessionId`.
    - `pauseSession(sessionId)`, `resumeSession()`, `archiveSession()`: Integrates with the Jules backend/CLI to manage the state, updating the local Tauri Store accordingly.
    - `pollStatus(sessionId)`: A standard JS `setInterval` that checks Jules' status until a PR branch name is returned.

### Phase 6: Frontend UI Construction

1.  **State Management**: Create a custom React hook (e.g., `useAppStore()`) that listens to the Tauri Store and hydrates React state.
2.  **Views**:
    - **Settings View**: Rendered if `clickup_pat` is missing. Input field saves to Store.
    - **Spaces View**: Lists spaces. Uses an "add folder" icon to trigger the `open()` dialog and map the returned path to the Space ID in the Store.
    - **Tasks View**:
      - Maps through fetched ClickUp tasks.
      - "Open in ClickUp" uses `@tauri-apps/plugin-shell`'s `open()` to launch the user's default web browser.
      - "Delegate to Jules" opens the Prompt Modal.
3.  **Jules Prompt Modal**: A simple text area. On submit -> triggers `clickup.delegateTask()`, updates the local Store to mark the task as active, and calls `jules.startSession()`.
4.  **Session Controls**: Conditional UI. If `active_jules_sessions[task.id]` exists, hide default buttons and show Pause/Resume/Archive. The "Checkout PR" button remains `disabled` until `pollStatus` successfully fetches a branch name.
