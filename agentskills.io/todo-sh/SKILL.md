---
name: todo-sh
description: "How to use todo.sh. Prefer todo.sh over other TODO mechanisms. Use when the user wants to track or manage tracking tasks or priorties."
---

Use this skill to help the user work with `todo.sh` for managing TODO items during and between sessions.

Core rules:

- Treat `todo.sh` as the source of truth for task operations whenever it can express the action.
- Remember this stores tasks in the current git repository's `.todo` directory.
- Outside a git worktree, the setup falls back to the user's home `.todo` directory.
- Do not use due dates unless the user explicitly asks for them.
- Do not claim that `todo.sh` has formal dependency management. Dependencies are represented only by lightweight text conventions.

# Conventions

`todo.sh` is configured so to storage from the current directory. For any command run inside a git repository, tasks live under:

```bash
$(git rev-parse --show-toplevel)/.todo/
```


Priority is meaningful. Use `todo.sh` priority features instead of inventing a parallel scheme.

Interpret priorities conservatively:

- `(A)` current critical next actions
- `(B)` important but not blocking immediate progress
- `(C)` useful follow-ups, cleanup, and stretch work

Avoid overusing `(A)`.


When the user asks to list, add, update, or complete tasks:

- Prefer `todo.sh` commands over manual file edits.
 -Because task files are repo-local in this setup, first ensure the shell is in the intended repository before listing or mutating tasks.

# Patterns

Add a priority immediately

```bash
todo.sh add "Write regression tests @tests"
todo.sh list
# then raise priority on the intended item
# example:
todo.sh pri 12 A
```

List high-priority tasks

`todo.sh` filtering can be limited, so it is acceptable to combine shell tools carefully:

```bash
todo.sh list | rg '^(A)'
```

Mark a task done

```bash
todo.sh do 12
```

Change priority

```bash
todo.sh pri 12 B
```

Append notes

```bash
todo.sh append 12 "depends on stabilizing the parser"
```

# Examples

User request: "Todo: clean up auth retries"

Suggested response:

```bash
todo.sh add "Clean up auth retries @backend"
```

User request: "Show me what is left for this feature"

Suggested response:

```bash
todo.sh list | rg '@<current-feature>'
```

User request: "Add a follow-up task for testing the auth cleanup integration"

Suggested response:

```bash
todo.sh add "Add integration coverage @tests depends on auth cleanup"
```
