---
name: reminder
description: Set a reminder to check back on long-running tasks. Use when managing cluster jobs, benchmarks, inference runs, or other processes that take time to complete.
---

# Reminder

Set a background timer for Claude to check back on long-running tasks.

## Purpose

When managing long-running processes (cluster jobs, benchmarks, inference, training runs, etc.), use this skill to wake yourself up after a delay. When the reminder triggers, check on the task status and decide next steps:

- Set another reminder if still running
- Make edits and resubmit if something failed
- Report results if complete
- Take any other appropriate action

## Usage

1. Parse the time (e.g., "30 minutes", "1 hour")
2. Convert to seconds
3. Run the command in the background using Bash with `run_in_background: true`
4. Include context about what to check on

## Command format

```bash
sleep SECONDS && echo "CHECK: description of what to check"
```

## Example Workflow

1. User asks to submit training jobs
2. Claude submits training jobs
3. Claude sets a reminder to check back
4. Reminder triggers → Claude checks training job status
5. Claude decides: wait longer (new reminder), fix any bugs and resubmit, or report completion

Other examples:

- After submitting a learning rate sweep: `sleep 1800 && echo "CHECK: learning rate sweep jobs on cluster"`
- After starting a benchmark: `sleep 3600 && echo "CHECK: benchmark run status"`
- After kicking off inference: `sleep 600 && echo "CHECK: inference batch progress"`
