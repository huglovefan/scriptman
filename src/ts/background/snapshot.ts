import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import {entriesToObject} from "../misc/entriesToObject";

type GAFRD = chrome.webNavigation.GetAllFrameResultDetails;

export type snapshot = {
	tabs: chrome.tabs.Tab[],
	frames: {[tabId: number]: GAFRD[]},
};

export const snapshot = async (): Promise<snapshot> => {
	const tabs = <chrome.tabs.Tab[]> await browser.tabs.query({});
	const frameEntries = await ZalgoPromise.map(tabs, async (tab) => {
		const tabId = tab.id!;
		const framesPromise = <GAFRD[]> await browser.webNavigation.getAllFrames({tabId});
		return <[number, GAFRD[]]> [tabId, framesPromise];
	});
	const frames = entriesToObject(frameEntries);
	return {tabs, frames};
};