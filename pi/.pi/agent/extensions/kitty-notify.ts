import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ESC = "\x1b";
let notificationSequence = 0;

function sanitize(text: string): string {
	return text.replace(/[\x00-\x1f\x7f]/g, " ").trim();
}

function writeTerminal(sequence: string): void {
	if (process.env.TMUX) {
		// tmux requires a DCS wrapper for terminal-specific escape sequences.
		const escaped = sequence.replaceAll(ESC, ESC + ESC);
		process.stdout.write(`${ESC}Ptmux;${escaped}${ESC}\\`);
		return;
	}

	process.stdout.write(sequence);
}

function notify(title: string, body: string): void {
	const id = `pi-${Date.now().toString(36)}-${notificationSequence++}`;
	writeTerminal(`${ESC}]99;i=${id}:d=0;${sanitize(title)}${ESC}\\`);
	writeTerminal(`${ESC}]99;i=${id}:p=body;${sanitize(body)}${ESC}\\`);
}

function formatDuration(milliseconds: number): string {
	const seconds = milliseconds / 1000;
	if (seconds < 60) return `${seconds.toFixed(1)}s`;

	const minutes = Math.floor(seconds / 60);
	return `${minutes}m ${Math.round(seconds % 60)}s`;
}

async function getTmuxLocation(pi: ExtensionAPI): Promise<string> {
	if (!process.env.TMUX) return "outside tmux";

	const args = ["display-message", "-p"];
	if (process.env.TMUX_PANE) args.push("-t", process.env.TMUX_PANE);
	args.push("#{session_name}:#{window_name} #{window_index}");

	const result = await pi.exec("tmux", args);
	return result.code === 0 ? result.stdout.trim() : "unknown tmux window";
}

export default function (pi: ExtensionAPI) {
	let startedAt: number | undefined;

	pi.on("agent_start", () => {
		startedAt ??= performance.now();
	});

	pi.on("agent_settled", async () => {
		const elapsed = startedAt === undefined ? undefined : performance.now() - startedAt;
		startedAt = undefined;

		const duration = elapsed === undefined ? "unknown duration" : formatDuration(elapsed);
		const location = await getTmuxLocation(pi);
		notify(`Pi · ${duration}`, location);
	});

	pi.registerCommand("kitty-notify-test", {
		description: "Send a test Kitty desktop notification",
		handler: async (_args, ctx) => {
			const location = await getTmuxLocation(pi);
			notify("Pi · 12.3s", location);
			ctx.ui.notify("Sent Kitty notification", "info");
		},
	});
}
