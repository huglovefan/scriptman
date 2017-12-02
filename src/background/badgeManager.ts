//
// singleton for managing the browser action badge for tabs
//

import {Script} from "./Script";
import {FRAME_ID_TOP} from "./background";
import webNavigation from "./webNavigation";

class BadgeManager {
	
	private readonly tabScripts = new Map<number, Set<Script>>();
	
	constructor () {
		this.onNavigationCommitted = this.onNavigationCommitted.bind(this);
		this.onTabRemoved = this.onTabRemoved.bind(this);
		webNavigation.onCommitted.addListener(this.onNavigationCommitted);
		chrome.tabs.onRemoved.addListener(this.onTabRemoved);
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
	
	/**
	 * adds a script to the list of scripts ran in the tab
	 */
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
	
	/**
	 * called from outside when a section of a script was injected in the top frame
	 */
	injectedScript (script: Script, tabId: number) {
		if (this.tabHasScript(tabId, script)) {
			return;
		}
		this.tabAddScript(tabId, script);
		this.tabUpdateBadge(tabId);
	}
}

export {BadgeManager};
export default new BadgeManager();