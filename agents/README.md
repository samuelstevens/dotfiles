# Shared Agent Skills

`agents/.agents/skills/` is the one copy of every skill shared across coding agents. The `agents` package stows it to `~/.agents/skills`, the user-level location of the [Agent Skills](https://agentskills.io) standard.

| agent | reads skills from | setup |
|---|---|---|
| Codex | `~/.agents/skills` | none |
| pi | `~/.agents/skills` | none |
| Claude Code | `~/.claude/skills` only | one symlink per skill in `claude/.claude/skills/` |

Claude Code does not read `~/.agents/skills` yet ([anthropics/claude-code#31005](https://github.com/anthropics/claude-code/issues/31005)). Its skills directory cannot simply point here either: Claude Code writes its own files into it (`synced/` for claude.ai account skills, `.trash/`), which `claude/.gitignore` keeps out of git.

## Add a skill

1. Create `agents/.agents/skills/<name>/SKILL.md`:

```md
---
name: my-skill
description: Do X. Use when the user asks for Y or Z.
---

# My Skill
```

2. Link it for Claude Code:

```sh
ln -s ../../../agents/.agents/skills/my-skill claude/.claude/skills/my-skill
```

3. Restart the agents so they rediscover skills.

No restow is needed: `~/.agents/skills` and `~/.claude/skills` are each one symlink into this repo, so new entries appear immediately.

## Skills installed elsewhere

A skill whose source of truth is another project is a symlink here, plus the usual Claude link. `rig` is installed to `~/.config/rig/skills/rig` by rig's `just install`:

```sh
ln -s ../../../../.config/rig/skills/rig agents/.agents/skills/rig
ln -s ../../../agents/.agents/skills/rig claude/.claude/skills/rig
```

## Vendored skills

Some skills are copied from upstream repositories rather than written here: `ast-grep` and `ast-grep-outline` from [ast-grep/agent-skill](https://github.com/ast-grep/agent-skill), `marimo-pair` from [marimo-team/marimo-pair](https://github.com/marimo-team/marimo-pair). The `skills` CLI is useful to find a skill and confirm its repository, but do not let it install: it installs per agent, which makes a second copy.

```sh
uvx deno -A npm:skills add marimo-team/marimo-pair --list
```

Copy the skill's own directory, not the repository root; one repository can hold several skills.

### Update marimo-pair

The copy is not a Git checkout, so update it from the latest tagged release. First check for intentional local changes that the update would overwrite:

```sh
git status --short -- agents/.agents/skills/marimo-pair
```

Then download the release and synchronize:

```sh
update_dir=$(mktemp -d "$HOME/.local/tmp/marimo-pair-update.XXXXXX")
ref=$(gh release view --repo marimo-team/marimo-pair --json tagName --jq .tagName)
git clone --depth 1 --branch "$ref" https://github.com/marimo-team/marimo-pair.git "$update_dir/repo"
rsync -a --delete "$update_dir/repo/skills/marimo-pair/" agents/.agents/skills/marimo-pair/
```

Review the diff and check the bundled scripts:

```sh
git diff -- agents/.agents/skills/marimo-pair
bash -n agents/.agents/skills/marimo-pair/scripts/*.sh
```

## Notes

- A skill for one agent only goes in that agent's own directory instead (`claude/.claude/skills/`, `~/.pi/agent/skills/`). Prefer shared.
- Name skills with lowercase letters, digits, and hyphens.
- Keep `SKILL.md` concise. Put larger material in `references/`, `scripts/`, or `assets/` only when needed.
