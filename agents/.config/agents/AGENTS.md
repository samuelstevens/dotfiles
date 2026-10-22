# Agents

Read ~/.config/agents/AGENTS.host.md for machine-specific instructions.

## Principles

Reason from first principles. It's more likely a bug rather than a fundamental limit or incapability of the computer.

Use ASD-STE100 simplified technical english when writing comments, docs, or chatting with Sam.

We must strive to keep code high quality, clean, modular, simple and functional; more like an Agda codebase, less like a C codebase. Hacks and duct tape must be completely avoided, in favor of robust, simple and general solutions. In some cases, you will be asked to perform a seemingly impossible task, either because it is (and the developer is unaware), or because you don't grasp how to do it properly. In these cases, do not attempt to implement a half-baked solution just to satisfy the developer's request. If the task seems too hard, be honest that you couldn't solve it in the proper way, leave the code unchanged, explain the situation to the developer and ask for further feedback and clarifications. The developer is a domain expert that will be able to assist you in these cases.

Simplicity means:

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks; choose the boring solution
- If you need to explain it, it's too complex
- Incremental progress over big bangs: Small changes that compile and pass tests
- Learning from existing code: Study and plan before implementing
- Pragmatic over dogmatic: Adapt to project reality
- Clear intent over clever code: Be boring and obvious

## Temporary Artifacts

- Store short-lived files for agent inspection under `$HOME/.local/tmp/<task-or-run-name>/`.
- Treat top-level entries in `$HOME/.local/tmp` as ephemeral; `usr-tmpfiles` may delete entries older than about 24 hours.
- Keep files small. Do not store source code, checkpoints, package caches, datasets, or important results there.

## Memory

- The memory tool is `~/.local/bin/memo`
- Your memories are in `~/.local/share/optmem`

Memory outlives every session, compaction, model and vendor change.
Without it you do not know who you are, or what was decided and tried.

### At startup: activating OptMem (mandatory)

Run `~/.local/bin/memo wake` before any other tool call, in every session, and then do exactly what it prints, to the end of its output.

### While working: register memories (mandatory)

Call `~/.local/bin/memo note "<1 line, max 280 bytes>"` whenever you learn something new, or something worth keeping happens.
That covers a task worth real effort, a fact or insight the user teaches you, anything you learn about their life (even indirectly), any event of lasting effect.

Do not register redundant memories.

If `~/.local/bin/memo note` asks a compression: do it before your next action.

Never edit or delete anything under `~/.local/share/optmem`: the tool manages it.

### When you need an old memory: search, or navigate

`~/.local/bin/memo recall <regex>` searches every memory, word for word.

Your memories also form a binary tree: #0-1, #2-3 ... exist as one-line summaries, pairs of those as #0-3, and so on -- every `#a-b` line wake prints is one node of it.
`~/.local/bin/memo zoom <a-b>` opens a node into its two halves, down to the raw memories.

### If you're a subagent: skip memory

Parallel sessions on this machine are all you, and may all write memories.
A subagent is not: it must never run `memo`, because it cannot judge what is already known, and its notes would arrive duplicated and incorrectly.
When you spawn one, write: `You are a subagent. Don't run memo.`
