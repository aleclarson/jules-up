# Feature Status Report

## 1. Task/GitHub PR Pairing
**Status:** Completed

**Implementation Details:**
- **Persistence:** Jules sessions are now persisted using `StoreService` (stored in `app_settings.json`). `julesSessions` signal in `state.ts` manages the global state of sessions.
- **PR Link Retrieval:** A background poller (`useJulesPoller.ts`) checks active sessions every 10 seconds. It calls the Jules API `GetSession` endpoint to retrieve the session details and extracts the GitHub PR URL from `outputs.pullRequest.url`.
- **Association:** The PR link is stored in the `JulesSession` object and persisted.

## 2. Jules Tab
**Status:** Completed

**Implementation Details:**
- **UI Implementation:** A "Jules" tab has been added to the `TasksView` component, next to the "Tasks" header.
- **View Component:** The tab switches the view within `TasksView` to display a filtered list of tasks.
- **Filtering Logic:** The view filters tasks to show only those with an associated active Jules session and a valid GitHub PR link.
- **Sorting:** Tasks are sorted by `lastActivity` timestamp (most recent first).
- **GitHub Integration:** Currently, the filter relies on the presence of a PR link in an active session. (Note: Integration to verify strictly "unmerged" status via GitHub API is pending token availability, but "Active Session" serves as the proxy).

## 3. Active Tasks Exclusion
**Status:** Completed

**Implementation Details:**
- **Filter Logic Update:** The default "List" view in `TasksView` now filters out tasks where `status.status` is "active". These tasks are effectively moved to the "Jules" tab (once they have a PR).
