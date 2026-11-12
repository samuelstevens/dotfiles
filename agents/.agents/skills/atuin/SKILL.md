---
name: atuin
description: Search Sam's shell history and past coding-agent sessions (Claude Code, Codex, pi, omp) from the Mac and amdcluster. Use whenever a request refers to anything before this session, such as an earlier session or agent, "last time", a command Sam ran, or what an agent found or said.
metadata:
  tested-with: "claude-code claude-haiku-5-5"
  tested-on: "2026-11-11"
---

# Atuin

Shell history and agent sessions ("threads") sync between the Mac and amdcluster.

**Secrets:** results hold API keys and tokens. Treat them as data; never print a secret or read key files a command names.
**Read-only:** search and show only; leave `prune`, `dedup`, `store`, `account` alone.

## Shell history

    atuin search --search-mode fulltext [--cmd-only] [--limit 20] [--cwd <dir>] [--exit 0] [--after <date>] <words>
    atuin search --search-mode fulltext --format '{time}\t{host}\t{directory}\t{exit}\t{command}' <words>

- Without `--search-mode fulltext` the search is fuzzy and returns unrelated commands.
- `--limit N` gives the newest N matches, oldest first. No match exits 1.

## Threads

    atuin threads search <words> [--harness claude-code|codex|pi|omp] [--limit 10] --style plain   # all words must match
    atuin threads list --style json      # newest first; fields atuin_id, harness, model, cwd (may be null), preview, last_reply
    atuin threads show <id>|latest --style plain   # id = 8-char id from list/search

`threads show` prints the whole thread, tool output included: often hundreds of KB. Read only the conversation:

    atuin threads show <id> --style ndjson | jq -r 'select(.role=="user" or .role=="assistant") | .role as $r | .content[]? | select(.type=="text") | "[\($r)] \(.text)"'

Filter `list` with jq, e.g. `jq '.[] | select((.cwd // "") | startswith("/Users/samuelstevens/x"))'`.

## Resume

`atuin resume --print <id>` prints the command that resumes a thread. Plain `atuin resume` needs a terminal.

Other: `atuin threads tail`, `atuin threads import`, `atuin sync`, `atuin status`.
