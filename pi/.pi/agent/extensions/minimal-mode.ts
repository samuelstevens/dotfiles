/**
 * Minimal Mode Example - Demonstrates a "minimal" tool display mode
 *
 * This extension overrides built-in tools to provide custom rendering:
 * - Collapsed mode: Shows a compact tool-call line plus a one-line result summary
 * - Expanded mode: Shows the complete tool call and full output
 *
 * This demonstrates how a "minimal mode" could work, where ctrl+o cycles through:
 * - Standard: Shows truncated output (current default)
 * - Expanded: Shows full output (current expanded)
 * - Minimal: Shows only tool call, no output (this extension's collapsed mode)
 *
 * Usage:
 *   pi -e ./minimal-mode.ts
 *
 * Then use ctrl+o to toggle between minimal (collapsed) and full (expanded) views.
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import {
	createBashTool,
	createEditTool,
	createFindTool,
	createGrepTool,
	createLsTool,
	createReadTool,
	createWriteTool,
} from "@earendil-works/pi-coding-agent";
import { Text } from "@earendil-works/pi-tui";
import { homedir } from "os";

/**
 * Shorten a path by replacing home directory with ~
 */
function shortenPath(path: string): string {
	const home = homedir();
	if (path.startsWith(home)) {
		return `~${path.slice(home.length)}`;
	}
	return path;
}

const COLLAPSED_ARG_LIMIT = 80;

function displayArg(text: string, expanded: boolean): string {
	const oneLine = text.replace(/[\t\r\n]+/g, " ").replace(/\s+/g, " ").trim();
	return expanded ? oneLine : oneLine.slice(0, COLLAPSED_ARG_LIMIT);
}

function textOutput(result): string {
	return result.content.find((item) => item.type === "text")?.text ?? "";
}

function lineCount(text: string): number {
	return text ? text.split("\n").length : 0;
}

function nonEmptyLineCount(text: string): number {
	return text.split("\n").filter((line) => line.trim()).length;
}

function formatBytes(bytes: number): string {
	return bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`;
}

function formatCount(count: number, singular: string, plural = `${singular}s`): string {
	return count === 0 ? `no ${plural}` : `${count} ${count === 1 ? singular : plural}`;
}

function markTiming(context): void {
	if (context.executionStarted && context.state.startedAt === undefined) {
		context.state.startedAt = Date.now();
		context.state.endedAt = undefined;
	}
}

function timingText(options, context): string | undefined {
	if (typeof context.state.startedAt !== "number") return undefined;
	if (!options.isPartial && typeof context.state.endedAt !== "number") {
		context.state.endedAt = Date.now();
	}
	const end = options.isPartial ? Date.now() : context.state.endedAt;
	const label = options.isPartial ? "Elapsed" : "Took";
	return `${label} ${(Math.max(0, end - context.state.startedAt) / 1000).toFixed(1)}s`;
}

function summary(theme, ok: boolean, details: string[]): Text {
	const status = theme.fg(ok ? "success" : "error", ok ? "success" : "failed");
	return new Text(`${status}${details.length ? theme.fg("dim", ` (${details.join(", ")})`) : ""}`, 0, 0);
}

function resultSummary(theme, options, context, details: string[]): Text {
	const timing = timingText(options, context);
	const allDetails = timing ? [...details, timing] : details;
	if (options.isPartial) {
		return new Text(
			`${theme.fg("warning", "running")}${allDetails.length ? theme.fg("dim", ` (${allDetails.join(", ")})`) : ""}`,
			0,
			0,
		);
	}
	return summary(theme, !context.isError, allDetails);
}

function diffStats(diff: string): { additions: number; removals: number } {
	let additions = 0;
	let removals = 0;
	for (const line of diff.split("\n")) {
		if (line.startsWith("+") && !line.startsWith("+++")) additions++;
		if (line.startsWith("-") && !line.startsWith("---")) removals++;
	}
	return { additions, removals };
}

// Cache for built-in tools by cwd
const toolCache = new Map<string, ReturnType<typeof createBuiltInTools>>();

function createBuiltInTools(cwd: string) {
	return {
		read: createReadTool(cwd),
		bash: createBashTool(cwd),
		edit: createEditTool(cwd),
		write: createWriteTool(cwd),
		find: createFindTool(cwd),
		grep: createGrepTool(cwd),
		ls: createLsTool(cwd),
	};
}

function getBuiltInTools(cwd: string) {
	let tools = toolCache.get(cwd);
	if (!tools) {
		tools = createBuiltInTools(cwd);
		toolCache.set(cwd, tools);
	}
	return tools;
}

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		ctx.ui.setToolsExpanded(false);
	});

	// =========================================================================
	// Read Tool
	// =========================================================================
	pi.registerTool({
		name: "read",
		label: "read",
		description:
			"Read the contents of a file. Supports text files and images (jpg, png, gif, webp). Images are sent as attachments. For text files, output is truncated to 2000 lines or 50KB (whichever is hit first). Use offset/limit for large files.",
		parameters: getBuiltInTools(process.cwd()).read.parameters,

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools.read.execute(toolCallId, params, signal, onUpdate);
		},

		renderCall(args, theme, context) {
			markTiming(context);
			let path = shortenPath(args.path || "...");
			if (args.offset !== undefined || args.limit !== undefined) {
				const startLine = args.offset ?? 1;
				const endLine = args.limit !== undefined ? startLine + args.limit - 1 : "";
				path += `:${startLine}${endLine ? `-${endLine}` : ""}`;
			}

			return new Text(
				`${theme.fg("toolTitle", theme.bold("read"))} ${theme.fg("accent", displayArg(path, context.expanded))}`,
				0,
				0,
			);
		},

		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const content = result.content[0];
				if (context.isError) return resultSummary(theme, options, context, []);
				if (content?.type === "image") return resultSummary(theme, options, context, ["image read"]);
				const output = content?.type === "text" ? content.text : "";
				const lines = lineCount(output);
				const size = lines > 1 ? formatCount(lines, "line") : formatBytes(Buffer.byteLength(output, "utf8"));
				return resultSummary(theme, options, context, [size]);
			}

			const textContent = result.content.find((c) => c.type === "text");
			if (!textContent || textContent.type !== "text") return new Text("", 0, 0);
			const output = textContent.text.split("\n").map((line) => theme.fg("toolOutput", line)).join("\n");
			return new Text(`\n${output}`, 0, 0);
		},
	});

	// =========================================================================
	// Bash Tool
	// =========================================================================
	pi.registerTool({
		name: "bash",
		label: "bash",
		description:
			"Execute a bash command in the current working directory. Returns stdout and stderr. Output is truncated to last 2000 lines or 50KB (whichever is hit first).",
		parameters: getBuiltInTools(process.cwd()).bash.parameters,

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools.bash.execute(toolCallId, params, signal, onUpdate);
		},

		renderCall(args, theme, context) {
			markTiming(context);
			const command = displayArg(args.command || "...", context.expanded);
			const timeout = args.timeout as number | undefined;
			const timeoutSuffix = timeout ? theme.fg("muted", ` (timeout ${timeout}s)`) : "";

			return new Text(
				`${theme.fg("toolTitle", theme.bold("$ "))}${theme.fg("accent", command)}${timeoutSuffix}`,
				0,
				0,
			);
		},

		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const output = textOutput(result);
				const details = context.isError ? [] : [formatCount(nonEmptyLineCount(output), "output line")];
				return resultSummary(theme, options, context, details);
			}

			const textContent = result.content.find((c) => c.type === "text");
			if (!textContent || textContent.type !== "text") return new Text("", 0, 0);
			const output = textContent.text.trim().split("\n").map((line) => theme.fg("toolOutput", line)).join("\n");
			return output ? new Text(`\n${output}`, 0, 0) : new Text("", 0, 0);
		},
	});

	// =========================================================================
	// Write Tool
	// =========================================================================
	pi.registerTool({
		name: "write",
		label: "write",
		description:
			"Write content to a file. Creates the file if it doesn't exist, overwrites if it does. Automatically creates parent directories.",
		parameters: getBuiltInTools(process.cwd()).write.parameters,

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools.write.execute(toolCallId, params, signal, onUpdate);
		},

		renderCall(args, theme, context) {
			markTiming(context);
			const path = displayArg(shortenPath(args.path || "..."), context.expanded);
			const lineCount = args.content ? args.content.split("\n").length : 0;
			const lineInfo = lineCount > 0 ? theme.fg("muted", ` (${lineCount} lines)`) : "";

			return new Text(
				`${theme.fg("toolTitle", theme.bold("write"))} ${theme.fg("accent", path)}${lineInfo}`,
				0,
				0,
			);
		},

		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const content = typeof context.args.content === "string" ? context.args.content : "";
				const lines = lineCount(content);
				const size = lines > 1 ? formatCount(lines, "line") : formatBytes(Buffer.byteLength(content, "utf8"));
				return resultSummary(theme, options, context, context.isError ? [] : [size]);
			}

			const textContent = result.content.find((c) => c.type === "text");
			return textContent?.type === "text" && textContent.text
				? new Text(`\n${theme.fg(context.isError ? "error" : "toolOutput", textContent.text)}`, 0, 0)
				: new Text("", 0, 0);
		},
	});

	// =========================================================================
	// Edit Tool
	// =========================================================================
	pi.registerTool({
		name: "edit",
		label: "edit",
		renderShell: "default",
		description:
			"Edit a file by replacing exact text. The oldText must match exactly (including whitespace). Use this for precise, surgical edits.",
		parameters: getBuiltInTools(process.cwd()).edit.parameters,

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools.edit.execute(toolCallId, params, signal, onUpdate);
		},

		renderCall(args, theme, context) {
			markTiming(context);
			const path = displayArg(shortenPath(args.path || "..."), context.expanded);
			return new Text(
				`${theme.fg("toolTitle", theme.bold("edit"))} ${theme.fg("accent", path)}`,
				0,
				0,
			);
		},

		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const diff = result.details?.diff;
				if (context.isError || typeof diff !== "string") return resultSummary(theme, options, context, []);
				const { additions, removals } = diffStats(diff);
				return resultSummary(theme, options, context, [`+${additions}`, `-${removals}`]);
			}

			const diff = result.details?.diff;
			if (typeof diff === "string") {
				const output = diff.split("\n").map((line) => {
					if (line.startsWith("+") && !line.startsWith("+++")) return theme.fg("success", line);
					if (line.startsWith("-") && !line.startsWith("---")) return theme.fg("error", line);
					return theme.fg("dim", line);
				}).join("\n");
				return new Text(`\n${output}`, 0, 0);
			}
			const output = textOutput(result);
			return output ? new Text(`\n${theme.fg(context.isError ? "error" : "toolOutput", output)}`, 0, 0) : new Text("", 0, 0);
		},
	});

	// =========================================================================
	// Find Tool
	// =========================================================================
	pi.registerTool({
		name: "find",
		label: "find",
		description:
			"Find files by name pattern (glob). Searches recursively from the specified path. Output limited to 200 results.",
		parameters: getBuiltInTools(process.cwd()).find.parameters,

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools.find.execute(toolCallId, params, signal, onUpdate);
		},

		renderCall(args, theme, context) {
			markTiming(context);
			let description = `${args.pattern || ""} in ${shortenPath(args.path || ".")}`;
			if (args.limit !== undefined) description += ` (limit ${args.limit})`;
			return new Text(
				`${theme.fg("toolTitle", theme.bold("find"))} ${theme.fg("accent", displayArg(description, context.expanded))}`,
				0,
				0,
			);
		},

		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const output = textOutput(result);
				const count = output === "No files found matching pattern" ? 0 : nonEmptyLineCount(output);
				return resultSummary(theme, options, context, context.isError ? [] : [formatCount(count, "file")]);
			}

			const output = textOutput(result).trim().split("\n").map((line) => theme.fg("toolOutput", line)).join("\n");
			return new Text(`\n${output}`, 0, 0);
		},
	});

	// =========================================================================
	// Grep Tool
	// =========================================================================
	pi.registerTool({
		name: "grep",
		label: "grep",
		description:
			"Search file contents by regex pattern. Uses ripgrep for fast searching. Output limited to 200 matches.",
		parameters: getBuiltInTools(process.cwd()).grep.parameters,

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools.grep.execute(toolCallId, params, signal, onUpdate);
		},

		renderCall(args, theme, context) {
			markTiming(context);
			let description = `/${args.pattern || ""}/ in ${shortenPath(args.path || ".")}`;
			if (args.glob) description += ` (${args.glob})`;
			if (args.limit !== undefined) description += ` limit ${args.limit}`;
			return new Text(
				`${theme.fg("toolTitle", theme.bold("grep"))} ${theme.fg("accent", displayArg(description, context.expanded))}`,
				0,
				0,
			);
		},

		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const output = textOutput(result);
				const count = output === "No matches found" ? 0 : nonEmptyLineCount(output);
				return resultSummary(theme, options, context, context.isError ? [] : [formatCount(count, "match", "matches")]);
			}

			const output = textOutput(result).trim().split("\n").map((line) => theme.fg("toolOutput", line)).join("\n");
			return new Text(`\n${output}`, 0, 0);
		}
	});

	// =========================================================================
	// Ls Tool
	// =========================================================================
	pi.registerTool({
		name: "ls",
		label: "ls",
		description:
			"List directory contents with file sizes. Shows files and directories with their sizes. Output limited to 500 entries.",
		parameters: getBuiltInTools(process.cwd()).ls.parameters,

		async execute(toolCallId, params, signal, onUpdate, ctx) {
			const tools = getBuiltInTools(ctx.cwd);
			return tools.ls.execute(toolCallId, params, signal, onUpdate);
		},

		renderCall(args, theme, context) {
			markTiming(context);
			let description = shortenPath(args.path || ".");
			if (args.limit !== undefined) description += ` (limit ${args.limit})`;
			return new Text(
				`${theme.fg("toolTitle", theme.bold("ls"))} ${theme.fg("accent", displayArg(description, context.expanded))}`,
				0,
				0,
			);
		},

		renderResult(result, options, theme, context) {
			if (!options.expanded) {
				const output = textOutput(result);
				const count = output === "(empty directory)" ? 0 : nonEmptyLineCount(output);
				return resultSummary(theme, options, context, context.isError ? [] : [formatCount(count, "entry", "entries")]);
			}

			const output = textOutput(result).trim().split("\n").map((line) => theme.fg("toolOutput", line)).join("\n");
			return new Text(`\n${output}`, 0, 0);
		}
	});
}
