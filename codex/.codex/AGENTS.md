# Global Codex Instructions

## Tool Preferences

- For Python syntax and basic static validation, prefer `uvx ruff check <path>` over `python -m py_compile <path>`.
- After editing Python files, prefer `uvx ruff format <path>` for formatting.
- After editing Markdown files with relative links, run `lychee` on the edited files if it is available.
- Use `python -m py_compile` only as a fallback when `ruff` is unavailable or when bytecode compilation is specifically required.
