//
// checks if scripts can be ran in or injected into a specific tab or frame
//

import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import FRAME_ID_TOP from "./FRAME_ID_TOP";
import {getBadgeManager} from "./getBackgroundPage";

// the badge manager counts injections in the top frame,
// so we can use it to check if scripts have been injected into it
function checkWithBadgeManager (tabId: number, frameId = FRAME_ID_TOP) {
	if (frameId !== FRAME_ID_TOP) {
		return ZalgoPromise.resolve(null);
	}
	return getBadgeManager().then((badgeManager) => {
		if (badgeManager.tabHasScripts(tabId)) {
			console.log("[canRunScripts] scripts have been ran in the tab");
			return true;
		}
		return null;
	});
}

function checkWithExecuteScript (tabId: number, frameId = FRAME_ID_TOP) {
	return new ZalgoPromise<boolean>((resolve) => {
		browser.tabs.executeScript(tabId, {
			allFrames: false,
			code: "true",
			frameId,
			matchAboutBlank: true,
			runAt: "document_start",
		}).then((results: any[]) => {
			resolve(Array.isArray(results) && results.some(Boolean));
		}).catch(() => {
			resolve(false);
		});
	});
}

export default function canRunScripts (tabId: number, frameId = FRAME_ID_TOP) {
	if (frameId === FRAME_ID_TOP) {
		checkWithBadgeManager(tabId, frameId).then((result) => {
			if (result !== null) return result;
			return checkWithExecuteScript(tabId, frameId);
		});
	}
	return checkWithExecuteScript(tabId, frameId);
}