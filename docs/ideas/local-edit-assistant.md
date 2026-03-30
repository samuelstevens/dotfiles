# Local Edit Assistant

> TL;DR: I want a small, opinionated coding assistant focused on highly local edits, especially comment-anchored edit requests, because that is the part of Aider that actually worked best for me. While Aider increasingly expanded into broader repository and workflow features, my own usage stayed narrow: identify a local change, trigger an edit, review a small patch. At the same time, I would prefer Codex subscription access over API-only usage. So the goal is not to build another general coding agent, but to preserve and refine that tight local editing loop in a tool that is intentionally resistant to scope expansion.

I do not want to build another general-purpose coding agent.

There are already many coding tools moving in that direction: broader task execution, more autonomy, subagents, web search, follow-up questioning, larger workflows, and increasingly elaborate customization. That is where a lot of the energy in the space is going. It is also exactly the direction I do not want to chase.

What I want is much narrower.

I want a coding assistant built specifically for **small, local, deliberate edits**. Not a system that tries to understand and improve the whole repository by default. Not a tool that turns a bounded request into a refactor. Not an agent that is always looking for the next thing it could helpfully do. I want something closer to a careful editing instrument: identify a local change, make the smallest viable patch, and stop.

This is partly about product scope, but the starting point is simpler than that: **Aider already does much of what I want.**

In practice, I was not using the full breadth of Aider. I was not primarily reaching for repo-wide reasoning, architect/editor workflows, or the broader direction the tool has been expanding toward. What I kept returning to was a much tighter loop: local edits, often triggered from comments, with a bounded change near the place I had already identified. In particular, I liked the workflow where I could leave a comment, append `aider!`, and have the tool make the nearby edit. That interaction felt right because it preserved the way I already think about code changes: local, contextual, and explicit.

So the problem is not that Aider fails the product test. In many ways, it passes it.

The problem is that the part of Aider I value most is not the part the broader market is optimizing for, and it is not the part I would want to keep expanding if I were designing for myself. At the same time, Aider’s access model is API-based, while I already have access to Codex through a ChatGPT subscription. That creates a practical mismatch: the editing experience I like is tied to an access path I do not want, while the model access I want is tied to tools that tend to be broader and more agentic than I need.

Given that, the idea is not “build a smarter agent.” It is closer to:

**Take the narrow, local edit loop I actually used in Aider, preserve it intentionally, and pair it with Codex subscription access.**

That means the real design challenge is restraint.

The tool should assume that most requests are local. It should begin from the belief that the user has already identified roughly where the change belongs. It should prefer editing in place over inventing abstractions. It should prefer modifying one file over touching five. It should treat broader refactors as exceptions that require explicit escalation, not as signs of intelligence.

The goal is not to maximize capability. The goal is to maximize trust.

A useful coding tool for me is one that respects scope. When I ask for a local fix, I do not want a system that eagerly decides the surrounding architecture also deserves improvement. I do not want a bounded request turned into repo gardening. I want the smallest patch that solves the problem I actually posed. The value is not that it can do more than I asked. The value is that it usually does not.

That is also why this should remain intentionally modest as a side project. I do not want to spend a large amount of energy trying to compete with the frontier of coding agents, especially when that frontier is not closely related to my day job and is moving fast enough that broader products will keep absorbing more features anyway. If this is worth building at all, it is because it occupies a narrow niche that remains personally useful even as more general tools improve.

That niche is: **comment-anchored, local, scope-disciplined editing.**

The ideal interaction is simple. I mark a specific place in the code. I describe the change I want. The tool treats that as a bounded editing task. It produces a small patch nearby. It does not expand outward unless I explicitly ask it to. It behaves less like an autonomous engineer and more like a precise code-editing companion.

This is not a project about beating Codex, Claude Code, or other general coding agents at breadth. It is a project about preserving a way of working that broader tools may gradually leave behind. The bet is that there is durable value in a tool whose defining feature is not that it can do everything, but that it is unusually good at doing a small thing without overreaching.

---

## Why I want this

I want this because I already know the shape of interaction that works best for me.

Aider got very close, especially in its local, comment-driven edit loop. But my usage of Aider was narrower than Aider itself. As the product expanded into repo maps, broader repository reasoning, architect/editor structure, and other larger workflows, my own center of gravity stayed near the smallest possible interaction: mark a local change, trigger an edit, review the patch.

At the same time, I would prefer to use Codex through subscription access rather than pay API usage for the workflow I already like.

So the motivation is a combination of product fit and access fit:

* the **workflow** I want is narrower than the direction many coding tools are heading
* the **tool** that currently fits that workflow best for me is tied to API access
* the **model access** I want is available through Codex subscription surfaces
* therefore the interesting possibility is a deliberately limited, Aider-like local editing tool built around that access path

---

## Intended scope

This tool is for **small, local, comment-anchored edits**.

The default interaction should be:

* identify a specific place in the code
* attach a short instruction or comment
* trigger the tool
* get a small patch near that location
* stop when the local task is complete

It should optimize for:

* locality
* minimal diffs
* bounded scope
* high trust
* low ceremony

---

## Non-goals

This tool is not trying to:

* become a general autonomous coding agent
* reason over the entire repository by default
* spin up subagents
* browse the web
* expand a local request into a multi-file cleanup
* compete on breadth with Codex, Claude Code, or similar tools
* reproduce the broader trajectory of Aider itself

The point is not to build a more capable system. The point is to build a stricter one.

---

## Further reading

* Taylor Town, **“Good Vibes: A Claude-Code Case-Study.”** Useful for the idea that LLM-assisted coding works best when the human provides structure, design judgment, and carefully bounded tasks rather than delegating everything at once.
  [https://taylor.town/diggit-000](https://taylor.town/diggit-000)

* Mario Zechner, **“Thoughts on slowing the fuck down.”** Useful as a counterweight to maximal-agent thinking, and for the broader case that unconstrained agentic coding often creates more mess, more drift, and more delayed cost than it first appears to.
  [https://mariozechner.at/posts/2026-03-25-thoughts-on-slowing-the-fuck-down/](https://mariozechner.at/posts/2026-03-25-thoughts-on-slowing-the-fuck-down/)
