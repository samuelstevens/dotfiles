---
name: codex-oracle
description: Ask for an asnwer by running OpenAI Codex CLI (codex exec) for feedback on ideas, designs, code, diffs, tests, implementation plans, etc. Use when you want a sanity check, critique, feedback, or review from codex.
---

# Codex Oracle

Use Codex CLI as an external reviewer. Your job is to:

1) assemble the minimal necessary context,
2) ask codex a precise review question,
3) summarize the feedback into actionable next steps.

## When to use

Use this skill when:

- The user asks for a second opinion or a sanity check
- The user asks "what do you think"? in order to get additional ideas
- When you need to be creative; codex can provide different ideas
- When you are planning and want feedback on ideas

## Guardrails

- Treat codex output as advice, not authority. Verify claims against the codebase.
- Prefer review-only runs: do not ask codex to edit files; ask for suggestions and diffs in text.
- Keep prompts short; include only the files/snippets needed. codex can read files based on its own tool use as it sees fit.
