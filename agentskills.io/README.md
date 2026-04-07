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
- `agentskills.io/peer-review/`

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

## Notes

- Put shared skill logic in `agentskills.io`, not inside one agent's private skills directory.
- Use lowercase, digits, and hyphens for skill names.
- Keep `SKILL.md` concise. Put larger helper material in `references/`, `scripts/`, or `assets/` only when needed.
- If a skill should be available only to one agent, keep it in that agent's own skills directory instead of `agentskills.io`.
