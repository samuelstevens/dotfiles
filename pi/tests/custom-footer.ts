// Run from ~/.dotfiles:
// PI_OFFLINE=1 pi --mode rpc --no-session -e ./pi/tests/custom-footer.ts </dev/null
import assert from "node:assert/strict";
import { FooterComponent as BuiltinFooter, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { visibleWidth } from "@earendil-works/pi-tui";
import { FooterComponent, formatLastMessage, lastMessageTimestamp } from "../.pi/agent/extensions/custom-footer.ts";

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		const date = new Date(2026, 8, 11, 14, 58);
		assert.equal(formatLastMessage(date.getTime(), date), "last message: 2:58PM");
		assert.equal(formatLastMessage(date.getTime(), new Date(2026, 8, 12)), "last message: 2:58PM on Fri Sep 11");
		assert.equal(formatLastMessage(date.getTime(), new Date(2027, 8, 11)), "last message: 2:58PM on Fri Sep 11");
		assert.equal(formatLastMessage(new Date(2026, 8, 11, 0, 5).getTime(), date), "last message: 12:05AM");
		assert.equal(formatLastMessage(new Date(2026, 8, 11, 12, 5).getTime(), date), "last message: 12:05PM");
		assert.equal(formatLastMessage(undefined), "");
		assert.equal(formatLastMessage(NaN), "");
		assert.equal(lastMessageTimestamp([]), undefined);
		const branch = [
			{ type: "message", timestamp: date.toISOString(), message: { role: "assistant", timestamp: 0 } },
			{ type: "message", timestamp: new Date().toISOString(), message: { role: "user" } },
			{ type: "message", timestamp: new Date().toISOString(), message: { role: "toolResult" } },
		];
		assert.equal(lastMessageTimestamp(branch as any), date.getTime());
		const usage = {
			input: 1234, output: 567, cacheRead: 8900, cacheWrite: 100,
			totalTokens: 10801, cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0.123 },
		};
		for (const populated of [false, true]) {
			const entries = populated ? [
				{ type: "message", message: { role: "assistant", usage } },
				{ type: "message", message: { role: "toolResult", usage } },
				{ type: "compaction", usage },
				{ type: "branch_summary", usage },
			] : [];
			let showTimestamp = false;
			const sessionManager = {
				getEntries: () => entries,
				getBranch: () => showTimestamp ? branch : [],
				getCwd: () => populated ? "/example/長い/project" : process.env.HOME,
				getSessionName: () => populated ? "Footer test" : undefined,
			};
			const footerData = {
				getGitBranch: () => populated ? "main" : null,
				getExtensionStatuses: () => populated ? new Map([["z", "second\nstatus"], ["a", "first"]]) : new Map(),
				getAvailableProviderCount: () => populated ? 2 : 1,
			};
			for (const percent of [0, 75, 95, null]) {
				for (const auto of [false, true]) {
					const getContextUsage = () => ({ percent, contextWindow: 272000 });
					const testCtx = { ...ctx, sessionManager, getContextUsage };
					const subscription = ctx.model && ctx.modelRegistry.isUsingOAuth(ctx.model) &&
						ctx.modelRegistry.getProvider(ctx.model.provider)?.auth.oauth?.isSubscription === true;
					const builtin = new BuiltinFooter({
						state: { model: ctx.model, thinkingLevel: pi.getThinkingLevel() },
						sessionManager, getContextUsage,
						modelRuntime: { isUsingSubscription: () => subscription },
					} as any, footerData as any);
					const custom = new FooterComponent(testCtx as any, pi, ctx.ui.theme, footerData as any);
					builtin.setAutoCompactEnabled(auto);
					custom.setAutoCompactEnabled(auto);
					for (let width = 1; width <= 180; width++) {
						const actual = custom.render(width);
						assert.deepEqual(actual, builtin.render(width), `render mismatch: width=${width}, populated=${populated}, percent=${percent}, auto=${auto}`);
						assert.ok(actual.every((line) => visibleWidth(line) <= width));
						showTimestamp = true;
						const stamped = custom.render(width);
						assert.deepEqual(stamped.slice(1), actual.slice(1), "stats and statuses must remain unchanged");
						assert.ok(stamped.every((line) => visibleWidth(line) <= width));
						if (width >= 80) {
							assert.equal(visibleWidth(stamped[0]), width);
							assert.ok(stamped[0].includes(formatLastMessage(date.getTime())));
						}
						showTimestamp = false;
						assert.deepEqual(custom.render(width), actual, "navigating to an empty branch clears the timestamp");
					}
				}
			}
		}
		console.error("custom-footer: timestamp tests pass; original stats and statuses unchanged");
	});
}
