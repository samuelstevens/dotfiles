import {
	CustomEditor,
	type ExtensionAPI,
} from "@earendil-works/pi-coding-agent";
import { CURSOR_MARKER } from "@earendil-works/pi-tui";

const ENABLE_FOCUS_REPORTING = "\x1b[?1004h";
const DISABLE_FOCUS_REPORTING = "\x1b[?1004l";
const FOCUSED_CURSOR = "\x1b[2 q"; // steady block
const UNFOCUSED_CURSOR = "\x1b[4 q"; // steady underline
const DEFAULT_CURSOR = "\x1b[0 q";
const FOCUS_IN = "\x1b[I";
const FOCUS_OUT = "\x1b[O";
const REVERSE_VIDEO = "\x1b[7m";
const RESET_STYLE = "\x1b[0m";

function removeFakeCursor(lines: string[]): string[] {
	return lines.map((line) => {
		const marker = line.indexOf(CURSOR_MARKER);
		if (marker === -1) return line;

		const reverse = marker + CURSOR_MARKER.length;
		if (!line.startsWith(REVERSE_VIDEO, reverse)) return line;

		const content = reverse + REVERSE_VIDEO.length;
		const reset = line.indexOf(RESET_STYLE, content);
		if (reset === -1) return line;

		return line.slice(0, reverse) + line.slice(content, reset) +
			line.slice(reset + RESET_STYLE.length);
	});
}

export default function (pi: ExtensionAPI) {
	let listening = false;
	let inputTail = "";

	const setFocused = (focused: boolean): void => {
		process.stdout.write(focused ? FOCUSED_CURSOR : UNFOCUSED_CURSOR);
	};

	const onData = (data: Buffer | string): void => {
		const input = inputTail + data.toString();
		let offset = 0;

		while (offset < input.length) {
			const focusIn = input.indexOf(FOCUS_IN, offset);
			const focusOut = input.indexOf(FOCUS_OUT, offset);
			if (focusIn === -1 && focusOut === -1) break;

			if (focusOut !== -1 && (focusIn === -1 || focusOut < focusIn)) {
				setFocused(false);
				offset = focusOut + FOCUS_OUT.length;
			} else {
				setFocused(true);
				offset = focusIn + FOCUS_IN.length;
			}
		}

		inputTail = input.slice(-2);
	};

	pi.on("session_start", (_event, ctx) => {
		if (
			ctx.mode !== "tui" || listening || !process.stdin.isTTY ||
			!process.stdout.isTTY
		) return;

		listening = true;
		const previousEditor = ctx.ui.getEditorComponent();
		ctx.ui.setEditorComponent((tui, theme, keybindings) => {
			const editor = previousEditor?.(tui, theme, keybindings) ??
				new CustomEditor(tui, theme, keybindings);
			const render = editor.render.bind(editor);
			editor.render = (width: number) => removeFakeCursor(render(width));
			return editor;
		});
		process.stdin.on("data", onData);
		process.stdout.write(ENABLE_FOCUS_REPORTING + FOCUSED_CURSOR);
	});

	pi.on("session_shutdown", () => {
		if (!listening) return;

		listening = false;
		process.stdin.off("data", onData);
		process.stdout.write(DISABLE_FOCUS_REPORTING + DEFAULT_CURSOR);
	});
}
