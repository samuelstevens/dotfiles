---
name: todo-sh
description: "How to use todo.sh in a branch-scoped workflow for software development tasks. Prefer todo.sh over other TODO mechanisms. Use when the user wants to track or manage tracking tasks or priorties."
---

Use this skill to help the user work with `todo.sh` for managing TODO items during and between sessions.

Core rules:

- Treat `todo.sh` as the source of truth for task operations whenever it can express the action.
- Remember that this local setup stores tasks in the current git repository's `.todo` directory when run from inside a git worktree.
- Outside a git worktree, the setup falls back to the user's home `.todo` directory.
- Scope all read and write operations to a single feature stream by default.
- Use the current git branch name as the canonical feature identifier unless the user explicitly names a different feature.
- Do not use due dates unless the user explicitly asks for them.
- Do not claim that `todo.sh` has formal dependency management. Dependencies are represented only by lightweight text conventions.

# Conventions to enforce

## Storage root

Assume `todo.sh` is configured so its config file is sourced on every invocation and derives storage from the current directory:

```bash
if git_root="$(git rev-parse --show-toplevel 2>/dev/null)"; then
  export TODO_DIR="$git_root/.todo"
else
  export TODO_DIR="$HOME/.todo"
fi

export TODO_FILE="$TODO_DIR/todo.txt"
export DONE_FILE="$TODO_DIR/done.txt"
export REPORT_FILE="$TODO_DIR/report.txt"
```

For any command run inside a git repository, tasks live under:

```bash
$(git rev-parse --show-toplevel)/.todo/
```

Run `todo.sh` commands from the target repository when repo-local task state matters. Do not assume a single global task file for all repositories.

To inspect the active file without relying on a custom action, source the selected config in the current shell context:

```bash
TODO_CFG="${TODOTXT_CFG_FILE:-${XDG_CONFIG_HOME:-$HOME/.config}/todo/config}"
. "$TODO_CFG"
printf '%s\n' "$TODO_FILE"
```

If a local custom action such as `todo.sh whichfile` or `todo.sh config` exists, it is also acceptable to use that to report `TODO_FILE`, `DONE_FILE`, and `REPORT_FILE`.

## Repo & branch-scoped task identity
Use the current git branch name as the canonical feature tag.

Derive it with:

```bash
git branch --show-current
```

Store that branch name in each task as a project token so the task can be filtered reliably. Prefer this exact convention:

- branch `feature/auth-refresh` becomes project token `+feature/auth-refresh`
- branch `bugfix/login-timeout` becomes project token `+bugfix/login-timeout`

Do not rewrite slashes unless the local setup requires it. Keep the exact branch string when possible.

## Optional metadata

Use lightweight dependency markers in plain text only. Prefer:

- `dep:<token>` for a prerequisite
- `blocks:<token>` for a downstream task

Examples:

- `dep:features/refactor-parser`
- `dep:bug/extract-auth-client`
- `blocks:sam/add-integration-tests`

These tokens are conventions only. They are not enforced by `todo.sh` itself.

## Priority is meaningful

Use `todo.sh` priority features instead of inventing a parallel scheme.

Interpret priorities conservatively:

- `(A)` current critical next actions
- `(B)` important but not blocking immediate progress
- `(C)` useful follow-ups, cleanup, and stretch work

Avoid overusing `(A)`.

# Default behavior

When the user asks to list, add, update, or complete tasks:

1. Infer the current git branch when available.
2. Narrow to that branch unless the user explicitly names another feature or asks for a cross-feature view.
3. Prefer `todo.sh` commands over manual file edits.
4. When searching tasks, match the branch project token first.
5. When dependencies are relevant, explain them as plain-text conventions, not native `todo.sh` features.

Never default to showing or modifying all tasks across all sources when multiple features may coexist. Always focus on one branch-scope first.

Because task files are repo-local in this setup, first ensure the shell is in the intended repository before listing or mutating tasks.

# Command patterns

## Add a task for the current branch

```bash
BRANCH="$(git branch --show-current)"
todo.sh add "Implement retry handling +${BRANCH} @backend dep:feature/extract-http-client"
```

## Add a priority immediately

```bash
BRANCH="$(git branch --show-current)"
todo.sh add "Write regression tests +${BRANCH} @tests"
todo.sh list +"${BRANCH}"
# then raise priority on the intended item
# example:
todo.sh pri 12 A
```

## List tasks only for one branch

```bash
BRANCH="$(git branch --show-current)"
todo.sh list +"${BRANCH}"
```

## List only high-priority tasks for one branch

`todo.sh` filtering can be limited, so it is acceptable to combine shell tools carefully:

```bash
BRANCH="$(git branch --show-current)"
todo.sh list +"${BRANCH}" | grep '^(A)'
```

## Mark a task done

```bash
todo.sh do 12
```

## Change priority

```bash
todo.sh pri 12 B
```

## Append dependency text or notes

```bash
todo.sh append 12 "dep:stabilize-parser"
```

## Archive completed tasks

```bash
todo.sh archive
```

# How to respond

When helping the user:

- Prefer giving exact commands that fit the current repository and branch.
- When branch context is unknown, tell the user the skill assumes the current git branch and show the command that derives it.
- Keep explanations short and operational.
- Distinguish clearly between native `todo.sh` features and team conventions.

# Native features vs conventions

State this clearly whenever relevant:

- Native: add, list, do, pri, append, archive, project tags, context tags.
- Convention only: branch-as-project-tag, `dep:` markers, interpreting a branch as a feature lane.

# Examples

User request: "Add a task for this branch to clean up auth retries"

Suggested response:

```bash
BRANCH="$(git branch --show-current)"
todo.sh add "Clean up auth retries +${BRANCH} @backend"
```

User request: "Show me what is left for this feature"

Suggested response:

```bash
BRANCH="$(git branch --show-current)"
todo.sh list +"${BRANCH}"
```

User request: "Add a blocked follow-up"

Suggested response:

```bash
BRANCH="$(git branch --show-current)"
todo.sh add "Add integration coverage +${BRANCH} @tests dep:finish-auth-retry-refactor"
```

User request: "What conventions are we using here?"

Explain:

- current git branch as the canonical feature tag
- `todo.sh` priorities for urgency
- plain-text `dep:` markers for lightweight prerequisites
- no reliance on due dates
