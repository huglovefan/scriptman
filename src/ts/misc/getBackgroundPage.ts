//
// methods for getting the background page or a few properties from it
//

import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
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
			backgroundPagePromise = ZalgoPromise.resolve(win);
		} else {
			backgroundPagePromise = new ZalgoPromise<BackgroundPageWindow>((resolve, reject) => {
				browser.runtime.getBackgroundPage()
					.then((backgroundPage: BackgroundPageWindow) => {
						if (!isBackgroundPage(backgroundPage)) {
							reject(new Error("Couldn't get background page"));
							return;
						}
						console.log("[getBackgroundPage] got it from browser.runtime");
						resolve(backgroundPage);
					}, reject);
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

const getThing = <K extends keyof ThingsToGet> (key: K, friendlyName: string = key) => {
	return getBackgroundPage()
		.then((backgroundPage) => {
			const result = (<ThingsToGet> backgroundPage)[key];
			if (result === undefined) {
				throw new Error(`Couldn't get ${friendlyName}`);
			}
			return result;
		});
};

export const getBadgeManager = () => getThing("BadgeManager", "badge manager");
export const getScriptManager = () => getThing("ScriptManager", "script manager");