//
// methods for getting the background page or a few properties from it
//

import browser from "webextension-polyfill";
import {BackgroundPageWindow} from "../background/background";
import isBackgroundPage from "./isBackgroundPage";

export default async function getBackgroundPage () {
	
	const win = window;
	if (isBackgroundPage(win)) {
		console.log("[getBackgroundPage] we're the background page");
		return win;
	}
	
	const backgroundPage = <BackgroundPageWindow> await browser.runtime.getBackgroundPage();
	if (!backgroundPage || !backgroundPage.ScriptManager) {
		throw new Error("Couldn't get background page");
	}
	console.log("[getBackgroundPage] got it from browser.runtime");
	return backgroundPage;
	
}

const getThing = async <K extends keyof BackgroundPageWindow> (key: K, friendlyName: string = key) => {
	const backgroundPage = await getBackgroundPage();
	const result = backgroundPage[key];
	if (result === undefined) {
		throw new Error(`Couldn't get ${friendlyName}`);
	}
	return result;
};

export const getBadgeManager = async () => (await getThing("BadgeManager", "badge manager"))!;
export const getScriptManager = async () => (await getThing("ScriptManager", "script manager"))!;