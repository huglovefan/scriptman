//
// checks if scripts can be ran in or injected into a specific tab or frame
//

import browser from "webextension-polyfill";
import FRAME_ID_TOP from "./FRAME_ID_TOP";
import {getBadgeManager} from "./getBackgroundPage";

export default async function canRunScripts (tabId: number, frameId = FRAME_ID_TOP) {
	
	// the badge manager counts injections in the top frame,
	// so we can use it to check if scripts have been injected into it
	if (frameId === FRAME_ID_TOP) {
		try {
			const badgeManager = await getBadgeManager();
			// only return true if we're sure about it,
			// there could just not be any scripts for the page
			if (badgeManager.tabHasScripts(tabId)) {
				console.log("[canRunScripts] scripts have been ran in the tab");
				return true;
			}
		} catch {
		}
	}
	
	// check if we can inject stuff
	try {
		const result: any[] = await browser.tabs.executeScript(tabId, {
			allFrames: false,
			code: "true",
			frameId,
			matchAboutBlank: true,
			runAt: "document_start",
		});
		// check if our true is in the result array
		if (Array.isArray(result) && result.length !== 0 && result.some(Boolean)) {
			console.log("[canRunScripts] injection succeeded");
			return true;
		}
		return false;
	} catch {
		console.log("[canRunScripts] injection failed");
		return false;
	}
	
}