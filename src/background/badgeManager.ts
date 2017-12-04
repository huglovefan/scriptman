//
// singleton for managing the browser action badge for tabs
//

import {Script} from "./Script";
import {FRAME_ID_TOP} from "./background";
import webNavigation from "./webNavigation";
import {SectionInjectEvent} from "./SectionInjectEvent";

class BadgeManager {
	
	private readonly tabScripts = new Map<number, Set<Script>>();
	
	constructor () {
		this.onNavigationCommitted = this.onNavigationCommitted.bind(this);
		this.onTabRemoved = this.onTabRemoved.bind(this);
		
		webNavigation.onCommitted.addListener(this.onNavigationCommitted);
		chrome.tabs.onRemoved.addListener(this.onTabRemoved);
		window.addEventListener("sectioninject", (e: SectionInjectEvent) => {
			if (e.detail.frameId === FRAME_ID_TOP) {
				this.injectedScript(e.detail.section.script, e.detail.tabId);
			}
		});
		window.addEventListener("sectionremove", (e: SectionInjectEvent) => {
			if (e.detail.frameId === FRAME_ID_TOP) {
				this.removedScript(e.detail.section.script, e.detail.tabId);
			}
		});
	}
	
	private onNavigationCommitted (details: chrome.webNavigation.WebNavigationTransitionCallbackDetails) {
		if (details.frameId !== FRAME_ID_TOP) {
			return;
		}
		this.tabClearScripts(details.tabId);
		this.tabUpdateBadge(details.tabId);
	}
	
	private onTabRemoved (tabId: number) {
		this.tabClearScripts(tabId, true);
	}
	
	/**
	 * clears the scripts injected for a tab, optionally deleting the backing map
	 */
	private tabClearScripts (tabId: number, deleteMap = false) {
		const scripts = this.tabScripts.get(tabId);
		if (scripts !== void 0) {
			if (deleteMap) {
				this.tabScripts.delete(tabId);
			} else {
				scripts.clear();
			}
		}
	}
	
	private tabAddScript (tabId: number, script: Script) {
		const scripts = this.tabScripts.get(tabId);
		if (scripts !== void 0) {
			scripts.add(script);
		} else {
			const set = new Set();
			set.add(script);
			this.tabScripts.set(tabId, set);
		}
	}
	private tabRemoveScript (tabId: number, script: Script) {
		const scripts = this.tabScripts.get(tabId);
		if (scripts === void 0) {
			return;
		}
		scripts.delete(script);
	}
	
	/**
	 * if a section of a script has been ran in a specific tab
	 */
	private tabHasScript (tabId: number, script: Script) {
		const scripts = this.tabScripts.get(tabId);
		return (scripts !== void 0) ? scripts.has(script) : false;
	}
	
	/**
	 * gets the number of scripts injected in the top frame of a tab
	 */
	private tabGetCount (tabId: number) {
		const scripts = this.tabScripts.get(tabId);
		return (scripts !== void 0) ? scripts.size : 0;
	}
	
	/**
	 * updates the badge for a specific tab
	 */
	private tabUpdateBadge (tabId: number) {
		const count = this.tabGetCount(tabId);
		chrome.browserAction.setBadgeText({
			text: (count !== 0) ? String(count) : "",
			tabId: tabId,
		});
	}
	
	private injectedScript (script: Script, tabId: number) {
		if (this.tabHasScript(tabId, script)) {
			return;
		}
		this.tabAddScript(tabId, script);
		this.tabUpdateBadge(tabId);
	}
	private removedScript (script: Script, tabId: number) {
		if (!this.tabHasScript(tabId, script)) {
			return;
		}
		this.tabRemoveScript(tabId, script);
		this.tabUpdateBadge(tabId);
	}
}

export default BadgeManager;