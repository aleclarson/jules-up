# Jules Sessions Debugging Guide

If the Jules Sessions view is not loading your sessions, please follow these steps to diagnose the issue.

## 1. Check Application Logs
Open the WebView developer console (Right-click -> Inspect Element, or `Ctrl+Shift+I` / `Cmd+Option+I` if enabled).
Look for error messages in the `Console` tab, particularly those starting with `Failed to fetch task` or `Failed to fetch PR status`.

## 2. Verify Data Persistence
The application stores session data in `app_settings.json`.
- **Location**: This file is located in the application data directory (OS-dependent).
- **Check**: Ensure `active_jules_sessions` object is not empty.
- **Action**: You can inspect the `julesSessions` state by logging it in the console if you are in a dev environment.

## 3. API Connectivity
- **ClickUp**: Ensure your ClickUp PAT is valid and has permissions to access the tasks associated with the sessions. The app attempts to fetch task details (name) for each session. If this fails, the session might still appear but with "Unknown Task".
- **GitHub**: The app uses the `gh` CLI to check PR status.
    - Ensure `gh` is installed and in your system PATH.
    - Ensure you are authenticated (`gh auth status`).
    - **Important**: If the repository path stored in the session is invalid or moved, the `gh` command will fail.

## 4. Filtering Logic
The view automatically filters out sessions that:
- Have a PR linked AND the PR status is `MERGED` or `CLOSED`.
- If you expect to see a closed session, this is why it is hidden.

## 5. Network/CORS
- If you see Network Errors, check if the Tauri permissions in `capabilities/default.json` allow access to `api.clickup.com` and `jules.googleapis.com`.

## 6. Manual Reset
If the state is corrupted, you can try clearing the sessions (backup `app_settings.json` first) or manually editing the file to remove invalid entries.
