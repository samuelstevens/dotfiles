# Global Codex Instructions

## Tool Preferences

- For Python syntax and basic static validation, prefer `uvx ruff check <path>` over `python -m py_compile <path>`.
- After editing Python files, prefer `uvx ruff format --preview <path>` for formatting.
- After editing Markdown files with relative links, run `lychee` on the edited files if it is available.
- Use `python -m py_compile` only as a fallback when `ruff` is unavailable or when bytecode compilation is specifically required.

## Temporary Artifacts

- Store short-lived files for agent inspection under `$HOME/.local/tmp/<task-or-run-name>/`.
- Treat top-level entries in `$HOME/.local/tmp` as ephemeral; `usr-tmpfiles` may delete entries older than about 24 hours.
- Do not store source code, checkpoints, package caches, datasets, or important results there. Move anything worth keeping into the project or durable storage.

## Host-Specific Instructions

Read ~/.config/agents/AGENTS.host.md for machine-specific instructions.
