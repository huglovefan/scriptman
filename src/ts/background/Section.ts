import {CHROME, FIREFOX} from "../browser/browser";
import {ReadonlyURL} from "../misc/ReadonlyURL";
import {Connector} from "./Connector";
import {CssInjection, Injection, JsInjection} from "./Injection";
import {AnyMatchInit, Match} from "./Match";
import {MatchList} from "./MatchList";
import {Script} from "./Script";
import {snapshot} from "./snapshot";

export namespace Section {
	export type FrameBehavior = "allFrames" | "topFrameOnly" | "subFramesOnly";
}

export interface SectionInit <TType extends string = string> {
	type: TType;
	body: string;
	frameBehavior: Section.FrameBehavior;
	matches: AnyMatchInit[];
	excludes: AnyMatchInit[];
}

export abstract class Section {
	public static from (init: AnySectionInit, script: Script) {
		switch (init.type) {
			case "js":
				return new JsSection(init, script);
			case "css":
				return new CssSection(init, script);
			default:
				throw new Error(`Unknown section type ${init!.type}`);
		}
	}
	public readonly matches: MatchList;
	public readonly excludes: MatchList;
	public readonly script: Script;
	public readonly injection: Injection;
	public readonly connector: Connector | null;
	public constructor (init: SectionInit<any>, script: Script, injection: Injection) {
		this.matches = new MatchList(init.matches.map(Match.from), true);
		this.excludes = new MatchList(init.excludes.map(Match.from), false);
		this.script = script;
		this.injection = injection;
		this.connector = (script.enabled) ?
			new Connector({
				excludes: this.excludes,
				frameBehavior: init.frameBehavior,
				injection: this.injection,
				matches: this.matches,
			}) :
			null;
	}
	public test (url: ReadonlyURL) {
		return (
			this.matches.test(url) &&
			!this.excludes.test(url)
		);
	}
	public disconnect () {
		if (this.connector === null) {
			return;
		}
		this.connector.disconnect();
	}
}

export namespace CssSection {
	export type CssOrigin = "user" | "author";
}

interface CssSectionInit extends SectionInit<"css"> {
	cssOrigin: CssSection.CssOrigin;
}

// tslint:disable:no-magic-numbers
const supportsCssOrigin =
	FIREFOX ? FIREFOX.equalOrNewer([53]) :
	CHROME ? CHROME.equalOrNewer([66, 0, 3326, 0]) :
	false;
// tslint:enable:no-magic-numbers

export class CssSection extends Section {
	public constructor (init: CssSectionInit, script: Script) {
		super(init, script, new CssInjection({
			code: init.body,
			...((supportsCssOrigin) ? {cssOrigin: init.cssOrigin} : {}),
			matchAboutBlank: true,
			runAt: "document_start",
		}));
	}
}

export namespace JsSection {
	export type Context = "extension" | "page";
	export type RunAt = "documentStart" | "documentEnd" | "documentIdle";
	export type SnakeCaseRunAt = "document_start" | "document_end" | "document_idle";
}

interface JsSectionInit extends SectionInit<"js"> {
	context: JsSection.Context;
	runAt: JsSection.RunAt;
}

const convertBody = (init: JsSectionInit) => {
	let result = init.body;
	result =
		(/\bawait\b/.test(init.body)) ?
			`(async()=>{\n${result}\n})().catch(e=>setTimeout(()=>{throw e}));` :
			`(()=>{\n${result}\n})();`;
	result = `"use strict";\n${result}`;
	if (init.context === "page") {
		result = `{let d=document,s=d.createElement("script");s.append(${
			JSON.stringify(result)});d.documentElement.append(s);s.remove()}`;
		result = `"use strict";\n${result}`;
	}
	return result;
};

const runAtMap: {
	[key in JsSection.RunAt]: JsSection.SnakeCaseRunAt;
} = {
	documentEnd: "document_end",
	documentIdle: "document_idle",
	documentStart: "document_start",
};

export class JsSection extends Section {
	public constructor (init: JsSectionInit, script: Script) {
		super(init, script, new JsInjection({
			code: convertBody(init),
			matchAboutBlank: true,
			runAt: runAtMap[init.runAt] || "document_end",
		}));
	}
}

export type AnySection = CssSection | JsSection;
export type AnySectionInit = CssSectionInit | JsSectionInit;