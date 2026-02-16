---
name: oracle
description: Ask another AI agent (Codex, Claude, Pi, Gemini) for feedback on ideas, designs, code, diffs, tests, or implementation plans. Use when you want a sanity check, critique, second opinion, or creative input from an external agent.
---

Use external AI agents as reviewers. Your job is to:

1. Assemble the minimal necessary context
2. Ask a precise question via the shell
3. Summarize the feedback into actionable next steps

## Agent commands

Agents may reason and explore existing code, so use a long timeout (300000ms+).

- `codex --yolo exec "question"`
- `claude --dangerously-skip-permissions --print "question"`
- `pi --print "question"`
- `gemini --yolo --prompt "question"`

## When to use

- You want a second opinion or sanity check
- You want creative or non-obvious ideas
- You're planning and want feedback on an approach
- You want to validate a design decision

## Guardrails

- Treat agent output as advice, not authority. Verify claims against the codebase.
- Prefer review-only: ask for suggestions and analysis, not file edits.
- Keep prompts short; include only necessary context. Agents can read files on their own.
- Encourage non-obvious thinking, exploration, and diversity of thought.
