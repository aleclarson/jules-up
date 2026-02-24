# Jules Desktop Implementation Todo List

This document tracks the progress of the Jules Desktop application. Tasks are assigned to fictional workers for parallel execution where possible.

## Worker Assignments
- **Alice**: Backend/Infrastructure (Tauri setup, Store)
- **Bob**: Service Layer (ClickUp, Git, Jules integrations)
- **Charlie**: Frontend/UI (React components, Views, State)

## Todo List

### Phase 1: Project Setup & Tauri Configuration (Alice)
- [ ] Initialize Tauri project with React and TypeScript
- [ ] Install required Tauri plugins (`store`, `http`, `shell`, `dialog`)
- [ ] Configure Tauri capabilities in `src-tauri/capabilities/default.json` (HTTP permissions, Shell scope)

### Phase 2: Persistence Setup (Alice)
- [ ] Create `src/services/store.ts`
- [ ] Initialize `Store` instance
- [ ] Implement typed getters/setters for `clickup_pat`, `space_repo_mappings`, and `active_jules_sessions`

### Phase 3: ClickUp Integration (Bob)
- [ ] Create `src/services/clickup.ts`
- [ ] Implement `getSpaces()`
- [ ] Implement `getLists(spaceId)`
- [ ] Implement `getTasks(listId)`
- [ ] Implement `delegateTask(taskId, userId)`

### Phase 4: Git Integration (Bob)
- [ ] Create `src/services/git.ts`
- [ ] Implement `selectRepoDirectory()` using `dialog` plugin
- [ ] Implement `checkoutBranch(repoPath, branchName)` using `shell` plugin

### Phase 5: Jules Integration (Bob)
- [ ] Create `src/services/jules.ts`
- [ ] Implement `startSession(repoPath, taskId, prompt)`
- [ ] Implement session control methods (`pause`, `resume`, `archive`)
- [ ] Implement `pollStatus(sessionId)`

### Phase 6: Frontend UI Construction (Charlie)
- [ ] **State Management**
    - [ ] Create `useAppStore` hook to bridge React state with Tauri Store
- [ ] **Views Implementation**
    - [ ] Create **Settings View** (PAT input)
    - [ ] Create **Spaces View** (List spaces, handle repo mapping)
    - [ ] Create **Tasks View** (Task list, "Open in ClickUp", "Delegate to Jules" buttons)
- [ ] **Modals & Controls**
    - [ ] Create **Jules Prompt Modal**
    - [ ] Implement **Session Controls** (Pause/Resume, Archive, Checkout PR)
