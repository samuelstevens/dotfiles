/**
 * Questions Extension
 *
 * Provides two workflows for structured user input:
 *
 * 1) Tool: `questions`
 *    The LLM can ask one or more multiple-choice questions in a single tool call.
 *    Each question can optionally allow a free-form "Other" answer.
 *
 * 2) Command: `/answer` (and shortcut `Ctrl+.`)
 *    Extracts questions from the last assistant message, shows an interactive Q&A UI,
 *    then submits your answers back to the agent.
 *
 * Install:
 *   - Save this file to: ~/.pi/agent/extensions/questions.ts
 *   - In pi: /reload
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { BorderedLoader } from "@mariozechner/pi-coding-agent";
import { complete, type Api, type Model, type UserMessage } from "@mariozechner/pi-ai";
import {
	Editor,
	type EditorTheme,
	Key,
	matchesKey,
	Text,
	truncateToWidth,
	type Component,
	type TUI,
	wrapTextWithAnsi,
} from "@mariozechner/pi-tui";
import { Type } from "@sinclair/typebox";

// -----------------------------
// Tool: questions
// -----------------------------

interface QuestionsOption {
	label: string;
	value?: string;
	description?: string;
}

type RenderOption = QuestionsOption & { isOther?: boolean };

interface QuestionsToolQuestion {
	id: string;
	label: string;
	question: string;
	options: Array<Required<Pick<QuestionsOption, "label" | "value">> & Pick<QuestionsOption, "description">>;
	allowOther: boolean;
	otherLabel: string;
}

interface QuestionsToolAnswer {
	id: string;
	value: string;
	label: string;
	wasCustom: boolean;
	index?: number;
}

interface QuestionsToolDetails {
	questions: QuestionsToolQuestion[];
	answers: QuestionsToolAnswer[];
	cancelled: boolean;
}

const QuestionsOptionSchema = Type.Object({
	label: Type.String({ description: "Display label for the option" }),
	value: Type.Optional(Type.String({ description: "Value returned when selected (defaults to label)" })),
	description: Type.Optional(Type.String({ description: "Optional description shown below label" })),
});

const QuestionsQuestionSchema = Type.Object({
	id: Type.Optional(Type.String({ description: "Unique identifier for this question (defaults to q1, q2, ...)" })),
	label: Type.Optional(Type.String({ description: "Short label for UI (defaults to Q1, Q2, ...)" })),
	question: Type.String({ description: "The question to ask the user" }),
	options: Type.Array(QuestionsOptionSchema, { description: "Options for the user to choose from" }),
	allowOther: Type.Optional(Type.Boolean({ description: "Allow free-form entry (default: true)" })),
	otherLabel: Type.Optional(
		Type.String({ description: "Label for the free-form entry option (default: 'Type something.')" }),
	),
});

const QuestionsParams = Type.Object({
	questions: Type.Array(QuestionsQuestionSchema, {
		description: "Questions to ask the user",
	}),
});

function normalizeOtherLabel(label: string | undefined): string {
	const v = (label || "Type something.").trim();
	return v.length > 0 ? v : "Type something.";
}

function normalizeQuestions(params: any): QuestionsToolQuestion[] {
	const questionsInput = Array.isArray(params.questions) ? params.questions : [];

	return questionsInput.map((q: any, i: number) => {
		const id = (q.id || `q${i + 1}`).toString();
		const label = (q.label || `Q${i + 1}`).toString();
		const question = (q.question || "").toString();

		const optionsInput = Array.isArray(q.options) ? q.options : [];
		const options = optionsInput.map((o: any) => ({
			label: (o?.label ?? "").toString(),
			value: ((o?.value ?? o?.label) ?? "").toString(),
			description: o?.description ? o.description.toString() : undefined,
		}));

		return {
			id,
			label,
			question,
			options,
			allowOther: q.allowOther !== false,
			otherLabel: normalizeOtherLabel(q.otherLabel),
		} as QuestionsToolQuestion;
	});
}

function errorQuestionsResult(message: string, details?: Partial<QuestionsToolDetails>) {
	return {
		content: [{ type: "text" as const, text: message }],
		details: {
			questions: details?.questions ?? [],
			answers: details?.answers ?? [],
			cancelled: true,
		} as QuestionsToolDetails,
	};
}

// -----------------------------
// Command: /answer
// -----------------------------

interface ExtractedQuestion {
	question: string;
	context?: string;
}

interface ExtractionResult {
	questions: ExtractedQuestion[];
}

const EXTRACTION_SYSTEM_PROMPT = `You are a question extractor. Given text from a conversation, extract any questions that need answering.

Output a JSON object with this structure:
{
  "questions": [
    {
      "question": "The question text",
      "context": "Optional context that helps answer the question"
    }
  ]
}

Rules:
- Extract all questions that require user input
- Keep questions in the order they appeared
- Be concise with question text
- Include context only when it provides essential information for answering
- If no questions are found, return {"questions": []}
`;

// Prefer a small/cheap model for extraction when available.
const EXTRACTION_MODEL_CANDIDATES: Array<{ provider: string; id: string }> = [
	{ provider: "openai-codex", id: "gpt-5.1-codex-mini" },
	{ provider: "anthropic", id: "claude-haiku-4-5" },
];

async function selectExtractionModel(ctx: ExtensionContext): Promise<Model<Api>> {
	if (!ctx.model) throw new Error("No model selected");

	for (const candidate of EXTRACTION_MODEL_CANDIDATES) {
		const model = ctx.modelRegistry.find(candidate.provider, candidate.id);
		if (!model) continue;
		const apiKey = await ctx.modelRegistry.getApiKey(model);
		if (apiKey) return model;
	}

	return ctx.model;
}

function parseExtractionResult(text: string): ExtractionResult | null {
	try {
		let jsonStr = text;
		const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
		if (jsonMatch) jsonStr = jsonMatch[1].trim();

		const parsed = JSON.parse(jsonStr);
		if (parsed && Array.isArray(parsed.questions)) {
			return parsed as ExtractionResult;
		}
		return null;
	} catch {
		return null;
	}
}

function findLastAssistantText(ctx: ExtensionContext): string | null {
	const branch = ctx.sessionManager.getBranch();

	for (let i = branch.length - 1; i >= 0; i--) {
		const entry = branch[i];
		if (entry.type !== "message") continue;

		const msg = entry.message as any;
		if (msg.role !== "assistant") continue;
		if (msg.stopReason !== "stop") return null;

		const textParts = (msg.content ?? [])
			.filter((c: any): c is { type: "text"; text: string } => c?.type === "text")
			.map((c: any) => c.text);

		if (textParts.length > 0) return textParts.join("\n");
	}

	return null;
}

class QnAComponent implements Component {
	private questions: ExtractedQuestion[];
	private answers: string[];
	private currentIndex = 0;
	private editor: Editor;
	private tui: TUI;
	private theme: any;
	private done: (result: string | null) => void;
	private confirmSubmit = false;

	private cachedWidth?: number;
	private cachedLines?: string[];

	constructor(questions: ExtractedQuestion[], tui: TUI, theme: any, done: (result: string | null) => void) {
		this.questions = questions;
		this.answers = questions.map(() => "");
		this.tui = tui;
		this.theme = theme;
		this.done = done;

		const editorTheme: EditorTheme = {
			borderColor: (s) => theme.fg("accent", s),
			selectList: {
				selectedPrefix: (t: string) => theme.fg("accent", t),
				selectedText: (t: string) => theme.fg("accent", t),
				description: (t: string) => theme.fg("muted", t),
				scrollInfo: (t: string) => theme.fg("dim", t),
				noMatch: (t: string) => theme.fg("warning", t),
			},
		};
		this.editor = new Editor(tui, editorTheme);
		this.editor.disableSubmit = true;
		this.editor.onChange = () => {
			this.invalidate();
			this.tui.requestRender();
		};
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}

	private saveCurrentAnswer(): void {
		this.answers[this.currentIndex] = this.editor.getText();
	}

	private navigateTo(index: number): void {
		if (index < 0 || index >= this.questions.length) return;
		this.saveCurrentAnswer();
		this.currentIndex = index;
		this.editor.setText(this.answers[index] || "");
		this.confirmSubmit = false;
		this.invalidate();
	}

	private submit(): void {
		this.saveCurrentAnswer();

		const parts: string[] = [];
		for (let i = 0; i < this.questions.length; i++) {
			const q = this.questions[i];
			const a = (this.answers[i] ?? "").trim() || "(no answer)";
			parts.push(`Q: ${q.question}`);
			if (q.context) parts.push(`> ${q.context}`);
			parts.push(`A: ${a}`);
			parts.push("");
		}

		this.done(parts.join("\n").trim());
	}

	private cancel(): void {
		this.done(null);
	}

	handleInput(data: string): void {
		// Submit confirmation.
		if (this.confirmSubmit) {
			if (matchesKey(data, Key.enter) || data.toLowerCase() === "y") {
				this.submit();
				return;
			}
			if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c")) || data.toLowerCase() === "n") {
				this.confirmSubmit = false;
				this.invalidate();
				this.tui.requestRender();
				return;
			}
			return;
		}

		// Global cancel.
		if (matchesKey(data, Key.escape) || matchesKey(data, Key.ctrl("c"))) {
			this.cancel();
			return;
		}

		// Navigation.
		if (matchesKey(data, Key.tab) || matchesKey(data, Key.right)) {
			if (this.currentIndex < this.questions.length - 1) {
				this.navigateTo(this.currentIndex + 1);
				this.tui.requestRender();
			}
			return;
		}

		if (matchesKey(data, Key.shift("tab")) || matchesKey(data, Key.left)) {
			if (this.currentIndex > 0) {
				this.navigateTo(this.currentIndex - 1);
				this.tui.requestRender();
			}
			return;
		}

		// Plain Enter moves forward; on last question it asks for confirmation.
		if (matchesKey(data, Key.enter) && !matchesKey(data, Key.shift("enter"))) {
			this.saveCurrentAnswer();
			if (this.currentIndex < this.questions.length - 1) {
				this.navigateTo(this.currentIndex + 1);
			} else {
				this.confirmSubmit = true;
				this.invalidate();
			}
			this.tui.requestRender();
			return;
		}

		// Everything else goes to the editor.
		this.editor.handleInput(data);
		this.invalidate();
		this.tui.requestRender();
	}

	render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) return this.cachedLines;

		const theme = this.theme;
		const addLine = (lines: string[], s: string) => lines.push(truncateToWidth(s, width));

		const lines: string[] = [];
		const q = this.questions[this.currentIndex];

		addLine(lines, theme.fg("accent", "─".repeat(width)));
		addLine(
			lines,
			theme.fg("accent", theme.bold(` Answer questions (${this.currentIndex + 1}/${this.questions.length})`)),
		);
		lines.push("");

		// Progress indicator.
		const dots: string[] = [];
		for (let i = 0; i < this.questions.length; i++) {
			const answered = (this.answers[i] ?? "").trim().length > 0;
			if (i === this.currentIndex) dots.push(theme.fg("accent", "●"));
			else if (answered) dots.push(theme.fg("success", "●"));
			else dots.push(theme.fg("dim", "○"));
		}
		addLine(lines, " " + dots.join(" "));
		lines.push("");

		// Question (wrapped).
		for (const l of wrapTextWithAnsi(theme.fg("accent", "Q: ") + theme.fg("text", q.question), width - 1)) {
			addLine(lines, " " + l);
		}

		// Optional context.
		if (q.context) {
			lines.push("");
			for (const l of wrapTextWithAnsi(theme.fg("muted", "> " + q.context), width - 1)) {
				addLine(lines, " " + l);
			}
		}

		lines.push("");
		addLine(lines, theme.fg("muted", " Answer:"));
		for (const l of this.editor.render(Math.max(10, width - 2))) {
			addLine(lines, " " + l);
		}
		lines.push("");

		if (this.confirmSubmit) {
			addLine(
				lines,
				theme.fg("warning", " Submit all answers?") +
					" " +
					theme.fg("dim", "(Enter/y to submit • Esc/n to keep editing)"),
			);
		} else {
			addLine(
				lines,
				theme.fg(
					"dim",
					" Tab/→ next • Shift+Tab/← prev • Enter next/confirm • Shift+Enter newline • Esc cancel",
				),
			);
		}

		addLine(lines, theme.fg("accent", "─".repeat(width)));

		this.cachedWidth = width;
		this.cachedLines = lines;
		return lines;
	}
}

// -----------------------------
// Extension entrypoint
// -----------------------------

export default function (pi: ExtensionAPI) {
	// LLM-callable multi-question tool.
	pi.registerTool({
		name: "questions",
		label: "Questions",
		description:
			"Ask the user one or more multiple-choice questions in a single tool call (optionally with a free-form 'Other' entry per question).",
		parameters: QuestionsParams,

		async execute(_toolCallId, params, _signal, _onUpdate, ctx) {
			if (!ctx.hasUI) {
				return errorQuestionsResult("Error: UI not available (running in non-interactive mode)");
			}

			const questions = normalizeQuestions(params);
			if (questions.length === 0) {
				return errorQuestionsResult("Error: No questions provided");
			}

			for (const q of questions) {
				if (!q.question.trim()) {
					return errorQuestionsResult("Error: A question is missing its 'question' text", { questions });
				}
				if (q.options.length === 0) {
					return errorQuestionsResult(`Error: Question '${q.id}' has no options`, { questions });
				}
			}

			const isMulti = questions.length > 1;
			const totalTabs = questions.length + 1; // questions + Submit

			const result = await ctx.ui.custom<QuestionsToolDetails>((tui, theme, _kb, done) => {
				// State
				let currentTab = 0;
				let optionIndex = 0;
				let inputMode = false;
				let inputQuestionId: string | null = null;
				let cachedLines: string[] | undefined;
				const answers = new Map<string, QuestionsToolAnswer>();

				// Editor for "Other"
				const editorTheme: EditorTheme = {
					borderColor: (s) => theme.fg("accent", s),
					selectList: {
						selectedPrefix: (t) => theme.fg("accent", t),
						selectedText: (t) => theme.fg("accent", t),
						description: (t) => theme.fg("muted", t),
						scrollInfo: (t) => theme.fg("dim", t),
						noMatch: (t) => theme.fg("warning", t),
					},
				};
				const editor = new Editor(tui, editorTheme);

				function refresh() {
					cachedLines = undefined;
					tui.requestRender();
				}

				function submit(cancelled: boolean) {
					done({
						questions,
						answers: Array.from(answers.values()),
						cancelled,
					});
				}

				function currentQuestion(): QuestionsToolQuestion | undefined {
					return questions[currentTab];
				}

				function currentOptions(): RenderOption[] {
					const q = currentQuestion();
					if (!q) return [];
					const opts: RenderOption[] = [...q.options];
					if (q.allowOther) {
						opts.push({ value: "__other__", label: q.otherLabel, isOther: true });
					}
					return opts;
				}

				function allAnswered(): boolean {
					return questions.every((q) => answers.has(q.id));
				}

				function advanceAfterAnswer() {
					if (!isMulti) {
						submit(false);
						return;
					}
					if (currentTab < questions.length - 1) {
						currentTab++;
					} else {
						currentTab = questions.length; // Submit tab
					}
					optionIndex = 0;
					refresh();
				}

				function saveAnswer(questionId: string, value: string, label: string, wasCustom: boolean, index?: number) {
					answers.set(questionId, { id: questionId, value, label, wasCustom, index });
				}

				// Editor submit callback
				editor.onSubmit = (value) => {
					if (!inputQuestionId) return;
					const trimmed = value.trim() || "(no response)";
					saveAnswer(inputQuestionId, trimmed, trimmed, true);
					inputMode = false;
					inputQuestionId = null;
					editor.setText("");
					advanceAfterAnswer();
				};

				function handleInput(data: string) {
					// Input mode: route to editor
					if (inputMode) {
						if (matchesKey(data, Key.escape)) {
							inputMode = false;
							inputQuestionId = null;
							editor.setText("");
							refresh();
							return;
						}
						editor.handleInput(data);
						refresh();
						return;
					}

					const q = currentQuestion();
					const opts = currentOptions();

					// Tab navigation (multi-question only)
					if (isMulti) {
						if (matchesKey(data, Key.tab) || matchesKey(data, Key.right)) {
							currentTab = (currentTab + 1) % totalTabs;
							optionIndex = 0;
							refresh();
							return;
						}
						if (matchesKey(data, Key.shift("tab")) || matchesKey(data, Key.left)) {
							currentTab = (currentTab - 1 + totalTabs) % totalTabs;
							optionIndex = 0;
							refresh();
							return;
						}
					}

					// Submit tab
					if (currentTab === questions.length) {
						if (matchesKey(data, Key.enter) && allAnswered()) {
							submit(false);
						} else if (matchesKey(data, Key.escape)) {
							submit(true);
						}
						return;
					}

					// Option navigation
					if (matchesKey(data, Key.up)) {
						optionIndex = Math.max(0, optionIndex - 1);
						refresh();
						return;
					}
					if (matchesKey(data, Key.down)) {
						optionIndex = Math.min(opts.length - 1, optionIndex + 1);
						refresh();
						return;
					}

					// Select option
					if (matchesKey(data, Key.enter) && q) {
						const opt = opts[optionIndex];
						if (opt.isOther) {
							inputMode = true;
							inputQuestionId = q.id;
							editor.setText("");
							refresh();
							return;
						}
						saveAnswer(q.id, opt.value ?? opt.label, opt.label, false, optionIndex + 1);
						advanceAfterAnswer();
						return;
					}

					// Cancel
					if (matchesKey(data, Key.escape)) {
						submit(true);
					}
				}

				function render(width: number): string[] {
					if (cachedLines) return cachedLines;

					const lines: string[] = [];
					const q = currentQuestion();
					const opts = currentOptions();

					const add = (s: string) => lines.push(truncateToWidth(s, width));

					add(theme.fg("accent", "─".repeat(width)));

					// Tab bar
					if (isMulti) {
						const tabs: string[] = ["← "];
						for (let i = 0; i < questions.length; i++) {
							const isActive = i === currentTab;
							const isAnswered = answers.has(questions[i].id);
							const box = isAnswered ? "■" : "□";
							const color = isAnswered ? "success" : "muted";
							const text = ` ${box} ${questions[i].label} `;
							const styled = isActive
								? theme.bg("selectedBg", theme.fg("text", text))
								: theme.fg(color, text);
							tabs.push(`${styled} `);
						}
						const canSubmit = allAnswered();
						const isSubmitTab = currentTab === questions.length;
						const submitText = " ✓ Submit ";
						const submitStyled = isSubmitTab
							? theme.bg("selectedBg", theme.fg("text", submitText))
							: theme.fg(canSubmit ? "success" : "dim", submitText);
						tabs.push(`${submitStyled} →`);
						add(` ${tabs.join("")}`);
						lines.push("");
					}

					function renderOptions() {
						for (let i = 0; i < opts.length; i++) {
							const opt = opts[i];
							const selected = i === optionIndex;
							const isOther = opt.isOther === true;
							const prefix = selected ? theme.fg("accent", "> ") : "  ";
							const color = selected ? "accent" : "text";
							if (isOther && inputMode) {
								add(prefix + theme.fg("accent", `${i + 1}. ${opt.label} ✎`));
							} else {
								add(prefix + theme.fg(color, `${i + 1}. ${opt.label}`));
							}
							if (opt.description) {
								add(`     ${theme.fg("muted", opt.description)}`);
							}
						}
					}

					// Content
					if (inputMode && q) {
						add(theme.fg("text", ` ${q.question}`));
						lines.push("");
						renderOptions();
						lines.push("");
						add(theme.fg("muted", " Your answer:"));
						for (const line of editor.render(width - 2)) {
							add(` ${line}`);
						}
						lines.push("");
						add(theme.fg("dim", " Enter to submit • Esc to cancel"));
					} else if (currentTab === questions.length) {
						add(theme.fg("accent", theme.bold(" Ready to submit")));
						lines.push("");
						for (const question of questions) {
							const answer = answers.get(question.id);
							if (answer) {
								const prefix = answer.wasCustom ? "(wrote) " : "";
								add(`${theme.fg("muted", ` ${question.label}: `)}${theme.fg("text", prefix + answer.label)}`);
							}
						}
						lines.push("");
						if (allAnswered()) {
							add(theme.fg("success", " Press Enter to submit"));
						} else {
							const missing = questions
								.filter((q) => !answers.has(q.id))
								.map((q) => q.label)
								.join(", ");
							add(theme.fg("warning", ` Unanswered: ${missing}`));
						}
					} else if (q) {
						add(theme.fg("text", ` ${q.question}`));
						lines.push("");
						renderOptions();
					}

					lines.push("");
					if (!inputMode) {
						const help = isMulti
							? " Tab/←→ navigate • ↑↓ select • Enter confirm • Esc cancel"
							: " ↑↓ navigate • Enter select • Esc cancel";
						add(theme.fg("dim", help));
					}
					add(theme.fg("accent", "─".repeat(width)));

					cachedLines = lines;
					return lines;
				}

				return {
					render,
					invalidate: () => {
						cachedLines = undefined;
					},
					handleInput,
				};
			});

			if (result.cancelled) {
				return {
					content: [{ type: "text", text: "User cancelled the questions" }],
					details: result,
				};
			}

			const answerLines = result.answers.map((a) => {
				const q = questions.find((qq) => qq.id === a.id);
				const qLabel = q?.label || a.id;
				if (a.wasCustom) return `${qLabel}: user wrote: ${a.label}`;
				return `${qLabel}: user selected: ${a.index}. ${a.label}`;
			});

			return {
				content: [{ type: "text", text: answerLines.join("\n") }],
				details: result,
			};
		},

		renderCall(args, theme) {
			const qs = Array.isArray((args as any).questions) ? (args as any).questions : [];
			const count = qs.length;
			const first = count > 0 && qs[0]?.question ? String(qs[0].question) : "";
			let text = theme.fg("toolTitle", theme.bold("questions ")) + theme.fg("muted", `${count} question${count === 1 ? "" : "s"}`);
			if (first) {
				text += "\n" + theme.fg("dim", truncateToWidth(`  First: ${first}`, 60));
			}
			return new Text(text, 0, 0);
		},

		renderResult(result, _options, theme) {
			const details = result.details as QuestionsToolDetails | undefined;
			if (!details) {
				const text = result.content[0];
				return new Text(text?.type === "text" ? text.text : "", 0, 0);
			}
			if (details.cancelled) {
				return new Text(theme.fg("warning", "Cancelled"), 0, 0);
			}

			const lines = details.answers.map((a) => {
				if (a.wasCustom) {
					return `${theme.fg("success", "✓ ")}${theme.fg("accent", a.id)}: ${theme.fg("muted", "(wrote) ")}${a.label}`;
				}
				const display = a.index ? `${a.index}. ${a.label}` : a.label;
				return `${theme.fg("success", "✓ ")}${theme.fg("accent", a.id)}: ${display}`;
			});
			return new Text(lines.join("\n"), 0, 0);
		},
	});

	// /answer command + shortcut.
	const answerHandler = async (ctx: ExtensionContext) => {
		if (!ctx.hasUI) {
			ctx.ui.notify("answer requires interactive mode", "error");
			return;
		}
		if (!ctx.model) {
			ctx.ui.notify("No model selected", "error");
			return;
		}

		const lastAssistantText = findLastAssistantText(ctx);
		if (!lastAssistantText) {
			ctx.ui.notify("Couldn't find a completed last assistant message", "error");
			return;
		}

		let extractionModel: Model<Api>;
		try {
			extractionModel = await selectExtractionModel(ctx);
		} catch (err: any) {
			ctx.ui.notify(err?.message || "Failed to select extraction model", "error");
			return;
		}

		const extractionResult = await ctx.ui.custom<ExtractionResult | null>((tui, theme, _kb, done) => {
			const loader = new BorderedLoader(tui, theme, `Extracting questions using ${extractionModel.id}...`);
			loader.onAbort = () => done(null);

			const doExtract = async () => {
				const apiKey = await ctx.modelRegistry.getApiKey(extractionModel);
				if (!apiKey) return null;

				const userMessage: UserMessage = {
					role: "user",
					content: [{ type: "text", text: lastAssistantText }],
					timestamp: Date.now(),
				};

				const response = await complete(
					extractionModel,
					{ systemPrompt: EXTRACTION_SYSTEM_PROMPT, messages: [userMessage] },
					{ apiKey, signal: loader.signal },
				);

				if (response.stopReason === "aborted") return null;

				const responseText = response.content
					.filter((c): c is { type: "text"; text: string } => c.type === "text")
					.map((c) => c.text)
					.join("\n");

				return parseExtractionResult(responseText);
			};

			doExtract()
				.then(done)
				.catch(() => done(null));

			return loader;
		});

		if (extractionResult === null) {
			ctx.ui.notify("Cancelled", "info");
			return;
		}

		if (!extractionResult || extractionResult.questions.length === 0) {
			ctx.ui.notify("No questions found in the last message", "info");
			return;
		}

		const answersText = await ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
			return new QnAComponent(extractionResult.questions, tui, theme, done);
		});

		if (answersText === null) {
			ctx.ui.notify("Cancelled", "info");
			return;
		}

		// Send answers back to the agent as a real user message.
		pi.sendUserMessage("Here are the answers:\n\n" + answersText);
	};

	pi.registerCommand("answer", {
		description: "Extract questions from last assistant message into an interactive Q&A UI",
		handler: (_args, ctx) => answerHandler(ctx),
	});

	pi.registerShortcut("ctrl+.", {
		description: "Extract and answer questions from last assistant message",
		handler: answerHandler,
	});
}
