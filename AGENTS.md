# AI Agent Guidelines

## Repository Context
This is a **Tauri 2.0** desktop application using a **Frontend-Heavy** architecture.
- **Framework**: React + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: No custom Rust code. Use Tauri plugins for OS interaction.

## Development Rules
1.  **Source of Truth**: Always refer to `@spec.md` for behavior and `@plan.md` for implementation details.
2.  **No Rust**: Do not modify Rust code unless absolutely necessary for configuration. Logic should reside in TypeScript.
3.  **Tauri Plugins**: Use the official plugins (`@tauri-apps/plugin-*`) as specified in the plan.
    - HTTP: `plugin-http` (for ClickUp API)
    - Store: `plugin-store` (for persistence)
    - Shell: `plugin-shell` (for Git/Jules commands)
    - Dialog: `plugin-dialog` (for file selection)
4.  **Verification**: After creating files or modifying code, verify the changes using `read_file` or `list_files`.
5.  **State Management**: Use Zustand or Context to manage UI state, but ensure data is persisted to the Tauri Store.

## File Structure
- `src/`: Frontend React code
- `src/services/`: TypeScript services for integrations (ClickUp, Git, Jules, Store)
- `src-tauri/`: Tauri configuration (Rust host)

## Pre-requisites
- Ensure `Node.js` and `Rust` (cargo) environments are understood (though you primarily write TS).
- When running shell commands, use the repository root.
