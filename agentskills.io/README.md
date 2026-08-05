# Shared Agent Skills

`agentskills.io/` is the source of truth for skills that should be available to multiple coding agents in this dotfiles repo.

The pattern is:

- Put the canonical skill contents in `agentskills.io/<skill-name>/`
- Add a `SKILL.md` file in that directory
- Symlink that directory into each agent's own skills directory
- Restow the affected agent packages
- Restart the agents so they rediscover skills

## Current Layout

Shared skills live here:

- `agentskills.io/interview/`
- `agentskills.io/<SKILLNAME>/`
- ...

Agent-specific symlinks point back to those shared directories:

- `codex/.codex/skills/interview -> ../../../agentskills.io/interview`
- `codex/.codex/skills/peer-review -> ../../../agentskills.io/peer-review`
- `claude/.claude/skills/interview -> ../../../agentskills.io/interview`
- `claude/.claude/skills/peer-review -> ../../../agentskills.io/peer-review`

`agentskills.io` is intentionally excluded from direct stow packaging in `stow-all.py`. The skills still work because the stowed agent directories contain symlinks that resolve back into this repo.

## Add A New Shared Skill

1. Create the shared skill directory:

```sh
mkdir -p agentskills.io/my-skill
```

2. Add `agentskills.io/my-skill/SKILL.md`:

```md
---
name: my-skill
description: Do X. Use when the user asks for Y or Z.
---

# My Skill

## When to use

- Case 1
- Case 2

## Workflow

1. Do the first thing
2. Check the result
3. Use helper scripts or references if needed
```

3. Symlink the skill into each agent that should see it:

```sh
ln -s ../../../agentskills.io/my-skill codex/.codex/skills/my-skill
ln -s ../../../agentskills.io/my-skill claude/.claude/skills/my-skill
```

4. Restow those packages:

```sh
uv run stow-all.py codex claude
```

5. Restart the agents.

## Add A Shared Skill From `npm:skills`

The `skills` CLI is useful for discovery, but its default install model is agent-specific. In this repo, that is not the source of truth for shared skills.

If a skill should be shared across agents, prefer this pattern:

1. Use `skills` to find the package or confirm its repository:

```sh
uvx deno -A npm:skills add marimo-team/marimo-pair --list
```

2. Put the canonical skill directory in `agentskills.io/` instead of installing it separately into each agent-managed skills directory. Some repositories contain multiple skills, so copy the desired subdirectory rather than assuming the repository root is a skill.

```sh
update_dir=$(mktemp -d "$HOME/.local/tmp/marimo-pair-install.XXXXXX")
git clone --depth 1 https://github.com/marimo-team/marimo-pair.git "$update_dir/repo"
cp -a "$update_dir/repo/skills/marimo-pair" agentskills.io/
cp -a "$update_dir/repo/skills/retro-marimo-pair" agentskills.io/
```

3. Symlink that shared directory into each agent that should see it:

```sh
ln -s ../../../agentskills.io/marimo-pair codex/.codex/skills/marimo-pair
ln -s ../../../agentskills.io/marimo-pair claude/.claude/skills/marimo-pair
ln -s ../../../../agentskills.io/marimo-pair pi/.pi/agent/skills/marimo-pair
ln -s ../../../agentskills.io/retro-marimo-pair codex/.codex/skills/retro-marimo-pair
ln -s ../../../agentskills.io/retro-marimo-pair claude/.claude/skills/retro-marimo-pair
ln -s ../../../../agentskills.io/retro-marimo-pair pi/.pi/agent/skills/retro-marimo-pair
```

4. Restow the affected packages:

```sh
uv run stow-all.py codex claude pi
```

5. Restart the agents so they rediscover the new skill.

## Update marimo-pair

The canonical copies are not Git checkouts, so update them from the latest tagged release. First make sure there are no intentional local changes that would be overwritten:

```sh
git status --short -- \
  agentskills.io/marimo-pair \
  agentskills.io/retro-marimo-pair
```

Then download the latest release and synchronize both skills:

```sh
update_dir=$(mktemp -d "$HOME/.local/tmp/marimo-pair-update.XXXXXX")
marimo_pair_ref=$(gh release view \
  --repo marimo-team/marimo-pair \
  --json tagName \
  --jq .tagName)

git clone --depth 1 --branch "$marimo_pair_ref" \
  https://github.com/marimo-team/marimo-pair.git \
  "$update_dir/repo"

rsync -a --delete \
  "$update_dir/repo/skills/marimo-pair/" \
  agentskills.io/marimo-pair/
rsync -a --delete \
  "$update_dir/repo/skills/retro-marimo-pair/" \
  agentskills.io/retro-marimo-pair/
```

Review the update and validate the bundled shell scripts:

```sh
git diff -- \
  agentskills.io/marimo-pair \
  agentskills.io/retro-marimo-pair
bash -n agentskills.io/marimo-pair/scripts/*.sh
```

The existing Claude, Codex, and Pi symlinks do not need to be recreated. Restart running agents so they reload the updated instructions.

### Why not `skills add` per agent?

For this repo, per-agent installs are only appropriate when a skill should live in one agent's private directory and be managed independently there.

For shared skills, per-agent installs create duplication and make updates harder because there is no single canonical copy in the repo. `agentskills.io/` plus symlinks is the preferred pattern.

## Notes

- Put shared skill logic in `agentskills.io`, not inside one agent's private skills directory.
- Use lowercase, digits, and hyphens for skill names.
- Keep `SKILL.md` concise. Put larger helper material in `references/`, `scripts/`, or `assets/` only when needed.
- If a skill should be available only to one agent, keep it in that agent's own skills directory instead of `agentskills.io`.
