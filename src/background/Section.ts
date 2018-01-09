import {ZalgoPromise} from "zalgo-promise";
import {CHROME} from "../browser/browser";
import FRAME_ID_TOP from "../misc/FRAME_ID_TOP";
import isBackgroundPage from "../misc/isBackgroundPage";
import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";
import {CssInjection, Injection, JsInjection} from "./Injection";
import {AnyMatch, AnyMatchInit, Match} from "./Match";
import {Script} from "./Script";

console.assert(isBackgroundPage());

//
//
//

interface SectionInitMap {
	js: JsSectionInit;
	css: CssSectionInit;
}

interface SectionClassMap {
	js: JsSection;
	css: CssSection;
}

export type AnySectionInit = SectionInitMap[keyof SectionInitMap];
export type AnySection = SectionClassMap[keyof SectionClassMap];

//
//
//

interface SectionInit <TType extends keyof SectionInitMap> {
	type: TType;
	frameBehavior: Section.FrameBehavior;
	body: string;
	matches: ReadonlyArray<AnyMatchInit>;
	excludes: ReadonlyArray<AnyMatchInit>;
}

export namespace Section {
	export type FrameBehavior = "allFrames" | "topFrameOnly" | "subFramesOnly";
}

export abstract class Section <TType extends keyof SectionClassMap> {
	
	public static from (init: AnySectionInit, script: Script): AnySection {
		switch (init.type) {
			case "css":
				return new CssSection(init, script);
			case "js":
				return new JsSection(init, script);
			default:
				throw new Error(`Unknown section type ${init!.type}`);
		}
	}
	
	public readonly script: Script;
	public readonly frameBehavior: Section.FrameBehavior;
	public readonly matches: ReadonlyArray<AnyMatch>;
	protected readonly excludes: ReadonlyArray<AnyMatch>;
	
	public abstract readonly injection: Injection;
	
	public constructor (init: SectionInit<TType>, script: Script) {
		this.script = script;
		this.frameBehavior = init.frameBehavior;
		this.matches = init.matches.map(Match.from);
		this.excludes = init.excludes.map(Match.from);
	}
	
	public testFrameId (frameId: number) {
		return (
			this.frameBehavior === "topFrameOnly" ? frameId === FRAME_ID_TOP :
			this.frameBehavior === "subFramesOnly" ? frameId !== FRAME_ID_TOP :
			true
		);
	}
	
	/**
	 * @returns true if the section should be injected for the URL
	 */
	public test (url: ReadonlyURL, checkExcludesOnly = false) {
		return (
			!this.excludes.some((exclude) => exclude.test(url)) &&
			(checkExcludesOnly || this.matches.length === 0 || this.matches.some((match) => match.test(url)))
		);
	}
	
	public injectIfMatches (url: ReadonlyURL, tabId: number, frameId: number) {
		if (!this.testFrameId(frameId) || !this.test(url)) {
			return ZalgoPromise.resolve(false);
		}
		return this.inject(tabId, frameId);
	}
	
	public injectIfNotExcluded (url: ReadonlyURL, tabId: number, frameId: number) {
		if (!this.testFrameId(frameId) || !this.test(url, true)) {
			return ZalgoPromise.resolve(false);
		}
		return this.inject(tabId, frameId);
	}
	
	private inject (tabId: number, frameId: number) {
		return this.injection.inject(tabId, frameId).then((injected) => {
			if (injected) {
				window.dispatchEvent(new CustomEvent("sectioninjected", {detail: {
					section: this,
					tabId,
					frameId,
				}}));
			}
			return injected;
		});
	}
	
	public remove (tabId: number, frameId: number) {
		return this.injection.remove(tabId, frameId).then((removed) => {
			if (removed) {
				window.dispatchEvent(new CustomEvent("sectioninjectionremoved", {detail: {
					section: this,
					tabId,
					frameId,
				}}));
			}
			return removed;
		});
	}
}

//
//
//

export namespace JsSection {
	export type CamelCaseRunAt = "documentStart" | "documentEnd" | "documentIdle";
	export type SnakeCaseRunAt = "document_start" | "document_end" | "document_idle";
	export type Context = "extension" | "page";
}

interface JsSectionInit extends SectionInit<"js"> {
	runAt: JsSection.CamelCaseRunAt;
	context: JsSection.Context;
}

class JsSection extends Section<"js"> {
	
	public readonly injection: Injection;
	
	public constructor (init: JsSectionInit, script: Script) {
		super(init, script);
		this.injection = new JsInjection({
			allFrames: false,
			code: JsSection.getInjectionBody(init),
			matchAboutBlank: true,
			runAt: JsSection.runAt_to_snakeCase[init.runAt],
		});
	}
	
	private static getInjectionBody (init: JsSectionInit) {
		let result = init.body;
		result =
			`"use strict";\n` +
			`(async()=>{\n` +
			`${result}\n` +
			(CHROME ?
				`})().catch(error => console.error("Uncaught", error));` :
				`})().catch(console.error);`);
		if (init.context === "page") {
			result =
				`"use strict";\n` +
				`{\n` +
				`const script = document.createElement("script");\n` +
				`script.textContent = ${JSON.stringify(result)};\n` +
				`document.documentElement.appendChild(script);\n` +
				`script.remove();\n` +
				`}`;
		}
		return result;
	}
	
	private static runAt_to_snakeCase: {
		[_ in JsSection.CamelCaseRunAt]: JsSection.SnakeCaseRunAt
	} = {
		documentStart: "document_start",
		documentEnd: "document_end",
		documentIdle: "document_idle",
	};
}

//
//
//

export namespace CssSection {
	export type CssOrigin = "user" | "author";
}

interface CssSectionInit extends SectionInit<"css"> {
	cssOrigin: CssSection.CssOrigin;
}

class CssSection extends Section<"css"> {
	
	public readonly injection: Injection;
	
	public constructor (init: CssSectionInit, script: Script) {
		super(init, script);
		this.injection = new CssInjection({
			// firefox errors if this is set to true:
			// "Error: 'frameId' and 'allFrames' are mutually exclusive"
			// allFrames: true,
			code: init.body,
			// https://crbug.com/632009
			// https://chromium-review.googlesource.com/c/chromium/src/+/778402
			...(!CHROME ? {cssOrigin: init.cssOrigin} : {}),
			matchAboutBlank: true,
			runAt: "document_start",
		});
	}
}