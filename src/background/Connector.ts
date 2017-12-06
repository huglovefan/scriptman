import {AnySection, Section} from "./Section";
import ScriptManager from "./ScriptManager";
import {FRAME_ID_TOP} from "./background";
import {FIREFOX} from "../browser/browser";
import webNavigation from "./webNavigation";
import URLCache from "../URLCache/URLCache";

export abstract class Connector {
	
	static for (section: AnySection): Connector {
		// https://github.com/greasemonkey/greasemonkey/issues/2574
		if (FIREFOX) {
			const connectors = [
				...((section.frameBehavior !== "subFramesOnly") ?
					[new WebNavigationConnector(section, "topFrameOnly")] : []),
				...((section.frameBehavior !== "topFrameOnly") ?
					[new WebRequestConnector(section, "subFramesOnly")] : []),
			];
			console.assert(connectors.length !== 0);
			if (connectors.length === 1) {
				return connectors[0];
			}
			return new Connector合体(connectors);
		}
		return new WebNavigationConnector(section);
	}
	
	readonly section: AnySection;
	
	constructor (section: AnySection) {
		this.section = section;
	}
	
	abstract disconnect (): void;
	abstract startupInject (data: ScriptManager.SnapshotData): void;
}

// todo: maybe this should be on Section? with a staticOnly flag?
function commonStartupInject (section: AnySection, data: ScriptManager.SnapshotData) {
	for (const tab of data.tabs) {
		for (const frame of data.frames[tab.id!]) {
			section.injectIfMatches(URLCache.get(tab.url!), tab.id!, frame.frameId);
		}
	}
}

function testFrameBehavior (frameBehavior: Section.FrameBehavior, frameId: number) {
	if (frameBehavior === "allFrames") {
		return true;
	}
	if (frameBehavior === "topFrameOnly") {
		return frameId === FRAME_ID_TOP;
	}
	if (frameBehavior === "subFramesOnly") {
		return frameId !== FRAME_ID_TOP;
	}
	throw new Error("Bad frameBehavior value " + frameBehavior);
}

/**
 * combines multiple connectors into one
 */
class Connector合体 extends Connector {
	
	private readonly connectors: ReadonlyArray<Connector>;
	
	constructor (connectors: ReadonlyArray<Connector>) {
		console.assert(connectors.length !== 0);
		super(connectors[0].section);
		this.connectors = connectors;
	}
	
	disconnect () {
		for (const connector of this.connectors) {
			connector.disconnect();
		}
	}
	
	startupInject (data: ScriptManager.SnapshotData) {
		for (const connector of this.connectors) {
			connector.startupInject(data);
		}
	}
}

class WebNavigationConnector extends Connector {
	
	private readonly frameBehavior: Section.FrameBehavior;
	
	constructor (section: AnySection, frameBehavior = section.frameBehavior) {
		super(section);
		this.frameBehavior = frameBehavior;
		this.callback = this.callback.bind(this);
		const urlFilters: ReadonlyArray<chrome.events.UrlFilter> =
			(this.section.matches.length === 0) ?
				[{}] :
				this.section.matches
					.reduce((result, match) =>
						result.concat(match.toUrlFilters()), <any[]> []);
		webNavigation.onCommitted.addListener(
			this.callback,
			{url: <any> urlFilters},
		);
	}
	
	private async callback (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
		// if the frameBehavior is overridden, checking the one in Section isn't enough
		if (this.frameBehavior !== this.section.frameBehavior &&
			!testFrameBehavior(this.frameBehavior, details.frameId)) {
			return;
		}
		// we already know the url matches the matches, so test only excludes
		await this.section.injectIfNotExcluded(URLCache.get(details.url), details.tabId, details.frameId);
	}
	
	disconnect () {
		webNavigation.onCommitted.removeListener(this.callback);
	}
	
	startupInject (data: ScriptManager.SnapshotData) {
		return commonStartupInject(this.section, data);
	}
}

class WebRequestConnector extends Connector {
	
	constructor (section: AnySection, frameBehavior = section.frameBehavior) {
		super(section);
		this.callback = this.callback.bind(this);
		const types = new Set(["main_frame", "sub_frame"]);
		if (frameBehavior === "topFrameOnly") {
			types.delete("sub_frame");
		}
		if (frameBehavior === "subFramesOnly") {
			types.delete("main_frame");
		}
		chrome.webRequest.onResponseStarted.addListener(
			this.callback,
			{urls: ["<all_urls>"], types: [...types]},
		);
	}
	
	private async callback (details: chrome.webRequest.WebResponseCacheDetails) {
		await this.section.injectIfMatches(URLCache.get(details.url), details.tabId, details.frameId);
	}
	
	disconnect () {
		chrome.webRequest.onResponseStarted.removeListener(this.callback);
	}
	
	startupInject (data: ScriptManager.SnapshotData) {
		return commonStartupInject(this.section, data);
	}
}