import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const ESC = "\x1b";
let notificationSequence = 0;

function sanitize(text: string): string {
	return text.replace(/\p{Cc}/gu, " ").trim();
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

async function prepareNotification(pi: ExtensionAPI): Promise<string> {
	if (!process.env.TMUX) return "outside tmux";

	const pane = process.env.TMUX_PANE;
	const args = ["display-message", "-p"];
	if (pane) args.push("-t", pane);
	args.push("#{session_name}: #{window_name} (#{window_index}/#{pane_index})");

	// The focus hook in ~/.tmux.conf consumes this one-shot pane target.
	if (pane) args.push(";", "set-option", "-gq", "@kitty_notify_pane", pane);

	const result = await pi.exec("tmux", args);
	return result.code === 0 ? result.stdout.trim() : "unknown tmux window";
}

function messagePreview(message: string): string {
	const newline = message.search(/\r?\n/);
	const firstLine = message.slice(0, newline === -1 ? undefined : newline).trim();
	const truncated = newline !== -1 || firstLine.length > 80;
	return `${firstLine.slice(0, 80)}${truncated ? "..." : ""}`;
}

export default function (pi: ExtensionAPI) {
	let latestMessage = "";

	pi.on("before_agent_start", () => {
		latestMessage = "";
	});

	pi.on("message_end", (event) => {
		if (event.message.role !== "assistant") return;

		latestMessage = event.message.content
			.filter((block) => block.type === "text")
			.map((block) => block.text)
			.join("\n");
	});

	pi.on("agent_settled", async () => {
		const location = await prepareNotification(pi);
		notify(`Pi · ${location}`, messagePreview(latestMessage) || "Finished");
	});

	pi.registerCommand("kitty-notify-test", {
		description: "Send a test Kitty desktop notification",
		handler: async (_args, ctx) => {
			const location = await prepareNotification(pi);
			notify(`Pi · ${location}`, "Test notification");
			ctx.ui.notify("Sent Kitty notification", "info");
		},
	});
}
