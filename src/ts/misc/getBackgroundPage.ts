//
// methods for getting the background page or a few properties from it
//

import browser from "webextension-polyfill";
import {BackgroundPageWindow} from "../background/background";
import {BadgeManager} from "../background/BadgeManager";
import {ScriptManager} from "../background/ScriptManager";
import {isBackgroundPage} from "./isBackgroundPageWindow";

let backgroundPagePromise: PromiseLike<BackgroundPageWindow> | null = null;

export const getBackgroundPage = () => {
	if (backgroundPagePromise === null) {
		const win = window;
		if (isBackgroundPage(win)) {
			console.log("[getBackgroundPage] we're the background page");
			backgroundPagePromise = Promise.resolve(win);
		} else {
			backgroundPagePromise = browser.runtime.getBackgroundPage().then((backgroundPage) => {
				if (!isBackgroundPage(backgroundPage)) {
					throw new Error("Couldn't get background page");
				}
				console.log("[getBackgroundPage] got it from browser.runtime");
				return backgroundPage;
			});
		}
	} else {
		console.log("[getBackgroundPage] used cached promise");
	}
	return backgroundPagePromise;
};

// just have them here as non-optional to fix the return type of getThing
interface ThingsToGet extends BackgroundPageWindow {
	BadgeManager: BadgeManager;
	ScriptManager: ScriptManager;
}

const getThing = async <K extends keyof ThingsToGet> (key: K) => {
	const backgroundPage = await getBackgroundPage();
	const result = (<ThingsToGet> backgroundPage)[key];
	if (result === undefined) {
		throw new Error(`Couldn't get ${key}`);
	}
	return result;
};

export const getBadgeManager = () => getThing("BadgeManager");
export const getScriptManager = () => getThing("ScriptManager");