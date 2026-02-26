# Feature Status Report

## 1. Task/GitHub PR Pairing
**Status:** Partially Implemented

**What's Done:**
- The data structure `JulesSession` includes a `prLink` field to store the GitHub PR URL.
- The `JulesPromptModal` component allows users to delegate a task to Jules, which initiates a session via `julesService`.

**What's Left to Do:**
- **Persistence:** The created session is only stored in the transient `activeSession` signal and is lost on application reload. It needs to be persisted using `StoreService`.
- **PR Link Retrieval:** There is currently no mechanism to retrieve the GitHub PR link from the Jules backend once it is created. The application needs to poll or receive updates from the Jules API to populate the `prLink` field in the session.
- **Association:** The link between the task and the PR is not permanently stored or updated in the application state beyond the initial session creation.

## 2. Jules Tab
**Status:** Missing

**What's Done:**
- None. There is no "Jules" tab or view in the current application.

**What's Left to Do:**
- **UI Implementation:** Add a "Jules" tab to the `Sidebar` and implement navigation in `App.tsx` to switch to this view.
- **View Component:** Create a `JulesView` (or similar) component to display the list of tasks.
- **Filtering Logic:** Implement logic to filter tasks that have an associated, active Jules session with an unmerged/unclosed GitHub PR.
- **Sorting:** Implement sorting logic to order these tasks by "most recently updated".
- **GitHub Integration:** Implement logic (likely via `JulesService` or a new `GitHubService`) to check the status of the PR (open/merged/closed) to ensure only relevant tasks are shown.

## 3. Active Tasks Exclusion
**Status:** Incomplete

**What's Done:**
- `TasksView.tsx` currently filters out tasks where `status.type` is "closed".

**What's Left to Do:**
- **Filter Logic Update:** Modify the filtering logic in `TasksView.tsx` (specifically in the `getTaskGroups` function) to also exclude tasks where `status.status` is "active" (or the specific ClickUp status representing "in progress"). Currently, these tasks are still displayed in the main list.
