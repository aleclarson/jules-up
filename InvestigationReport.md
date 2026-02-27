# Jules Sessions Investigation Report

This document outlines potential issues and areas for improvement identified during the review of the Jules Sessions feature.

## 1. Security & Command Injection
The `GitService` utilizes `Command.create("exec-sh", ...)` to execute shell commands (`gh`, `code`).
- **Risk**: While `repoPath` is selected via the OS file picker (reducing risk), `prUrl` is retrieved from the external Jules API. If the API returns a malicious URL containing shell metacharacters, it could lead to command injection.
- **Mitigation**: Ensure strict validation of `prUrl` to confirm it matches expected GitHub URL patterns before passing it to the shell.

## 2. Performance & Rate Limiting
The `JulesSessionsView` fetches details for all active sessions in parallel using `Promise.all`.
- **Issue**: Each session with a PR triggers a `gh pr view` command. If a user has many active sessions (e.g., >10), this spawns multiple concurrent shell processes and makes concurrent API requests to GitHub.
- **Consequence**: This may hit GitHub CLI rate limits or cause local system lag due to process spawning.
- **Recommendation**: Implement batching or a concurrency limit for these status checks.

## 3. Data Consistency
Sessions store a local `repoPath`, while the app also maintains a global `repoMappings` (Space ID -> Path).
- **Issue**: When mapping a repository for a specific session in `JulesSessionsView`, only the session's `repoPath` is updated. The global `repoMappings` for the corresponding Space is not automatically updated because the Space ID might not be readily available or consistent.
- **Consequence**: Future sessions in the same space might prompt for mapping again.
- **Observation**: The current implementation prioritizes getting the specific session working, which is acceptable but could be improved for better UX.

## 4. Error Handling
The `useSWR` fetcher suppresses some errors to ensure the UI renders partially (e.g., "Unknown Task").
- **Observation**: This is generally good for resilience, but valid errors (like authentication failures with `gh`) might be swallowed in the logs, making debugging harder for the end user without looking at the console.
