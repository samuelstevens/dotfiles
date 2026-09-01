import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFileSync } from "node:fs";

const ESC = "\x1b";
const ICON_DATA = readFileSync(new URL("./pi-icon.png", import.meta.url)).toString("base64");
const ICON_CHUNK_SIZE = 2048;
const TMUX_NOTIFICATION_KEY = 42;
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

function notificationId(): string {
	return `pi-${Date.now().toString(36)}-${notificationSequence++}`;
}

function notify(id: string, title: string, body: string): void {
	writeTerminal(`${ESC}]99;i=${id}:d=0:a=focus,report;${sanitize(title)}${ESC}\\`);

	for (let offset = 0; offset < ICON_DATA.length; offset += ICON_CHUNK_SIZE) {
		const chunk = ICON_DATA.slice(offset, offset + ICON_CHUNK_SIZE);
		writeTerminal(`${ESC}]99;i=${id}:d=0:e=1:p=icon;${chunk}${ESC}\\`);
	}

	writeTerminal(`${ESC}]99;i=${id}:p=body;${sanitize(body)}${ESC}\\`);
}

async function prepareNotification(pi: ExtensionAPI, id: string): Promise<string> {
	if (!process.env.TMUX) return "outside tmux";

	const pane = process.env.TMUX_PANE;
	const args = ["display-message", "-p"];
	if (pane) args.push("-t", pane);
	args.push("#{session_name}: #{window_name} (#{window_index}/#{pane_index})");

	if (pane) {
		const activation = `${ESC}]99;i=${id};${ESC}\\`;
		args.push(";", "set-option", "-gq", "@kitty_notify_pane", pane);
		args.push(
			";",
			"set-option",
			"-sq",
			`user-keys[${TMUX_NOTIFICATION_KEY}]`,
			activation,
		);
	}

	const result = await pi.exec("tmux", args);
	return result.code === 0 ? result.stdout.trim() : "unknown tmux window";
}

function messagePreview(message: string): string {
	const newline = message.search(/\r?\n/);
	const firstLine = message.slice(0, newline === -1 ? undefined : newline)
		.trim();
	const truncated = newline !== -1 || firstLine.length > 80;
	return `${firstLine.slice(0, 80)}${truncated ? " ..." : ""}`;
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
		const id = notificationId();
		const location = await prepareNotification(pi, id);
		notify(id, `Pi · ${location}`, messagePreview(latestMessage) || "Finished");
	});

	pi.registerCommand("kitty-notify-test", {
		description: "Send a test Kitty desktop notification",
		handler: async (_args, ctx) => {
			const id = notificationId();
			const location = await prepareNotification(pi, id);
			notify(id, `Pi · ${location}`, "Test notification");
			ctx.ui.notify("Sent Kitty notification", "info");
		},
	});
}
