import {DefaultMap} from "../misc/DefaultMap";
import {FRAME_ID_TOP} from "../misc/FRAME_ID_TOP";
import {NavigationDetails, onNavigated} from "./onNavigated";
import {Script} from "./Script";
import {ScriptStore, ScriptStoreEventDetail} from "./ScriptStore";
import {Section} from "./Section";

const isEventForEnabledScript = ({script: {enabled}}: ScriptStoreEventDetail) => {
	return enabled;
};

const isTopFrameEvent = ({frameId}: {frameId: number}) => {
	return frameId === FRAME_ID_TOP;
};

export class BadgeManager {
	private readonly tabScripts: DefaultMap<number, Set<Script>>;
	public constructor (scriptStore: ScriptStore) {
		if (scriptStore.ready) {
			console.error("BadgeManager: the ScriptStore has already loaded");
		}
		this.onNavigated = this.onNavigated.bind(this);
		this.onTabRemoved = this.onTabRemoved.bind(this);
		this.registerScript = this.registerScript.bind(this);
		this.unregisterScript = this.unregisterScript.bind(this);
		this.tabScripts = new DefaultMap(() => new Set());
		onNavigated
			.filter(isTopFrameEvent)
			.addListener(this.onNavigated);
		chrome.tabs.onRemoved
			.addListener(this.onTabRemoved);
		scriptStore.onScriptAdded
			.filter(isEventForEnabledScript)
			.addListener(this.registerScript);
		scriptStore.onScriptRemoved
			.filter(isEventForEnabledScript)
			.addListener(this.unregisterScript);
	}
	public tabHasScripts (tabId: number) {
		return (
			this.tabScripts.has(tabId) &&
			this.tabScripts.get(tabId).size !== 0
		);
	}
	private registerScript ({script}: ScriptStoreEventDetail) {
		console.assert(script.enabled);
		for (const section of script.sections) {
			const injection = section.injection;
			injection.onInjected
				.filter(isTopFrameEvent)
				.addListener(({tabId}) => this.onSectionInjected(section, tabId));
			injection.onRemoved
				.filter(isTopFrameEvent)
				.addListener(({tabId}) => this.onSectionRemoved(section, tabId));
		}
	}
	private unregisterScript ({script}: ScriptStoreEventDetail) {
		console.assert(script.enabled);
		for (const [tabId, tabScripts] of this.tabScripts) {
			tabScripts.delete(script);
			// replace with a "dummy" to keep the count?
			this.deleteSetIfEmpty(tabId);
		}
	}
	private onSectionInjected (section: Section, tabId: number) {
		this.tabScripts.get(tabId).add(section.script);
		this.updateBadgeForTab(tabId);
	}
	private onSectionRemoved (section: Section, tabId: number) {
		this.tabScripts.get(tabId).delete(section.script);
		this.updateBadgeForTab(tabId);
	}
	private deleteSetIfEmpty (tabId: number) {
		if (this.tabScripts.get(tabId).size === 0) {
			this.tabScripts.delete(tabId);
		}
	}
	private updateBadgeForTab (tabId: number) {
		const text = String(this.tabScripts.get(tabId).size);
		chrome.browserAction.setBadgeText({tabId, text});
		this.deleteSetIfEmpty(tabId);
	}
	private onNavigated (details: NavigationDetails) {
		console.assert(details.frameId === FRAME_ID_TOP);
		this.onTabRemoved(details.tabId);
	}
	private onTabRemoved (tabId: number) {
		this.tabScripts.get(tabId).clear();
		this.deleteSetIfEmpty(tabId);
	}
}
