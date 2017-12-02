import {AnySection, Section} from "./Section";
import {scriptManager} from "./ScriptManager";
import {URLCache} from "./URLCache";
import {FRAME_ID_TOP} from "./background";
import {FIREFOX} from "../browser";
import BadgeManager from "./badgeManager";
import webNavigation from "./webNavigation";

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
	abstract startupInject (data: scriptManager.SnapshotData): void;
}

// maybe this should be on Section?
function commonStartupInject (section: AnySection, data: scriptManager.SnapshotData) {
	for (const tab of data.tabs) {
		for (const frame of data.frames[tab.id!]) {
			const injectedPromise = section.injectIfMatches(URLCache.get(tab.url!), tab.id!, frame.frameId);
			if (frame.frameId !== FRAME_ID_TOP) {
				continue;
			}
			injectedPromise.then(injected => {
				if (!injected) {
					return;
				}
				BadgeManager.injectedScript(section.script, tab.id!);
			});
		}
	}
}

//
//
//

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
	
	startupInject (data: scriptManager.SnapshotData) {
		for (const connector of this.connectors) {
			connector.startupInject(data);
		}
	}
}

//
//
//

class WebNavigationConnector extends Connector {
	
	protected readonly frameBehavior: Section.FrameBehavior;
	
	constructor (section: AnySection, frameBehavior = section.frameBehavior) {
		super(section);
		this.callback = this.callback.bind(this);
		this.frameBehavior = frameBehavior;
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
	
	protected callback (details: chrome.webNavigation.WebNavigationFramedCallbackDetails) {
		// we already know the url matches the matches
		const injectedPromise = this.section.injectIfNotExcluded(URLCache.get(details.url), details.tabId, details.frameId);
		if (details.frameId !== FRAME_ID_TOP) {
			return;
		}
		injectedPromise.then(injected => {
			if (!injected) {
				return;
			}
			BadgeManager.injectedScript(this.section.script, details.tabId);
		});
	}
	
	disconnect () {
		webNavigation.onCommitted.removeListener(this.callback);
	}
	
	startupInject (data: scriptManager.SnapshotData) {
		return commonStartupInject(this.section, data);
	}
}

class WebRequestConnector extends Connector {
	
	constructor (section: AnySection, frameBehavior = section.frameBehavior) {
		super(section);
		this.callback = this.callback.bind(this);
		const types =
			(frameBehavior === "allFrames") ? ["main_frame", "sub_frame"] :
			(frameBehavior === "topFrameOnly") ? ["main_frame"] :
			(frameBehavior === "subFramesOnly") ? ["sub_frame"] : null;
		if (types === null) {
			throw new Error("Bad frameBehavior value " + frameBehavior);
		}
		chrome.webRequest.onResponseStarted.addListener(
			this.callback,
			{urls: ["<all_urls>"], types},
		);
	}
	
	callback (details: chrome.webRequest.WebResponseCacheDetails) {
		const injectedPromise = this.section.injectIfMatches(URLCache.get(details.url), details.tabId, details.frameId);
		if (details.frameId !== FRAME_ID_TOP) {
			return;
		}
		injectedPromise.then(injected => {
			if (!injected) {
				return;
			}
			BadgeManager.injectedScript(this.section.script, details.tabId);
		});
	}
	
	disconnect () {
		chrome.webRequest.onResponseStarted.removeListener(this.callback);
	}
	
	startupInject (data: scriptManager.SnapshotData) {
		return commonStartupInject(this.section, data);
	}
}