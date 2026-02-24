# Jules Desktop Implementation Todo List

This document tracks the progress of the Jules Desktop application. Tasks are separated by worker to facilitate parallel execution.

## Worker Assignments
- **Alice**: Backend/Infrastructure (Tauri setup, Store)
- **Bob**: Service Layer (ClickUp, Git, Jules integrations)
- **Charlie**: Frontend/UI (Preact components, Views, State)

## Alice's Tasks (Backend/Infrastructure)
- [ ] Initialize Tauri project with Preact and TypeScript
- [ ] Install required Tauri plugins (`store`, `http`, `shell`, `dialog`)
- [ ] Configure Tauri capabilities in `src-tauri/capabilities/default.json` (HTTP permissions, Shell scope)
- [ ] Create `src/services/store.ts`
- [ ] Initialize `Store` instance
- [ ] Implement typed getters/setters for `clickup_pat`, `space_repo_mappings`, and `active_jules_sessions`
- [ ] **Stub**: Create empty `src/services/clickup.ts`, `src/services/git.ts`, and `src/services/jules.ts` files so Bob can start working.

## Bob's Tasks (Service Layer)
- [ ] **Stub**: Create a mock `src/services/store.ts` if Alice hasn't finished it yet.
- [ ] **ClickUp Service**: Implement `src/services/clickup.ts`
    - [ ] `getSpaces()`
    - [ ] `getLists(spaceId)`
    - [ ] `getTasks(listId)`
    - [ ] `delegateTask(taskId, userId)`
- [ ] **Git Service**: Implement `src/services/git.ts`
    - [ ] `selectRepoDirectory()`
    - [ ] `checkoutBranch(repoPath, branchName)`
- [ ] **Jules Service**: Implement `src/services/jules.ts`
    - [ ] `startSession(repoPath, taskId, prompt)`
    - [ ] `pauseSession()`, `resumeSession()`, `archiveSession()`
    - [ ] `pollStatus(sessionId)`

## Charlie's Tasks (Frontend/UI)
- [ ] **Stub**: Create mock versions of `clickup`, `git`, `jules`, and `store` services to develop UI in isolation.
- [ ] **State Management**
    - [ ] Set up Preact Signals to manage application state.
- [ ] **Views Implementation**
    - [ ] Create **Settings View** (PAT input)
    - [ ] Create **Spaces View** (List spaces, handle repo mapping)
    - [ ] Create **Tasks View** (Task list, "Open in ClickUp", "Delegate to Jules" buttons)
- [ ] **Modals & Controls**
    - [ ] Create **Jules Prompt Modal**
    - [ ] Implement **Session Controls** (Pause/Resume, Archive, Checkout PR)

## Phase: Alignment & Integration
- [ ] Replace all stubs with real implementations.
- [ ] Verify data flow from UI (Charlie) through Services (Bob) to Store/Tauri (Alice).
- [ ] Perform end-to-end testing of the delegation workflow.
