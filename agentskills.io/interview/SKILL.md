---
name: interview
description: Structured interviewing to elicit requirements and clarify decisions, then write a spec to a user-specified path. Use when asked to interview the user about a task, gather non-obvious requirements, or produce a spec after Q&A.
---

Interview the user in depth. Prefer a question tool if available; otherwise ask in chat. Focus on non-obvious details: constraints, implementation, tradeoffs, failure modes, UX edge cases, risks, dependencies, and acceptance criteria. Be creative. Ask questions without obvious answers. Continue until you can summarize decisions and open questions clearly.

Ask questions incrementally, not in a single large block. Ask 1-6 questions at a time, wait for answers, then adapt the next round based on what you learn. Repeat this iterative cycle: ask -> get answers -> reason -> ask again. The goal is a conversational, interactive process, not a monolithic questionnaire.

Be very in-depth and continue interviewing the user continually until it's complete. Write the spec to the user-provided path. If no path is provided, infer from repo conventions and confirm the location before writing.

If other agents are available, get feedback from other agents. Use the shell to ask other agents for feedback. Other agents might reason and/or explore existing code, so use a long timeout. Encourage non-obvious thinking, exploration and diversity of thought.

- `codex --yolo exec "question"`
- `claude --dangerously-skip-permissions --print "question"`
- `pi --print "question"`
- `gemini --yolo --prompt "question"`

After getting agent feedback, if there are non-obvious answers or non-trivial changes, continue interviewing the user and getting agent feedback until you feel you have addressed all concerns.
