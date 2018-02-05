//
// checks if we can run scripts in a specific tab/frame
//

import browser from "webextension-polyfill";
import {FRAME_ID_TOP} from "./FRAME_ID_TOP";
import {getBadgeManager} from "./getBackgroundPage";

// the badge manager counts injections in the top frame,
// so we can use it to check if scripts have been injected into it
const checkWithBadgeManager = async (tabId: number, frameId = FRAME_ID_TOP) => {
	console.assert(frameId !== FRAME_ID_TOP);
	const badgeManager = await getBadgeManager();
	if (!badgeManager.tabHasScripts(tabId)) {
		// not sure, maybe there just aren't any
		return null;
	}
	console.log("[canRunScripts] scripts have been ran in the tab");
	return true;
};

const checkWithExecuteScript = async (tabId: number, frameId = FRAME_ID_TOP) => {
	try {
		const results = await browser.tabs.executeScript(tabId, {
			allFrames: false,
			code: "true",
			frameId,
			matchAboutBlank: true,
			runAt: "document_start",
		});
		return Array.isArray(results) && results.some(Boolean);
	} catch (error) {
		console.error(error);
		return false;
	}
};

export const canRunScripts = async (tabId: number, frameId = FRAME_ID_TOP) => {
	if (frameId === FRAME_ID_TOP) {
		const result = await checkWithBadgeManager(tabId, frameId);
		if (result !== null) {
			return result;
		}
	}
	return await checkWithExecuteScript(tabId, frameId);
};