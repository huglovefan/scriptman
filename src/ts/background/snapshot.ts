import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import {entriesToObject} from "../misc/entriesToObject";

type GAFRD = chrome.webNavigation.GetAllFrameResultDetails;

export type snapshot = {
	tabs: chrome.tabs.Tab[],
	frames: {[frameId: number]: GAFRD[]},
};

export const snapshot = (): PromiseLike<snapshot> => {
	return (<Promise<chrome.tabs.Tab[]>> browser.tabs.query({}))
		.then((tabs) => {
			const framePromiseEntries = tabs.map((tab) => {
				const tabId = tab.id!;
				const framesPromise =
					<Promise<GAFRD[]>> browser.webNavigation.getAllFrames({tabId});
				return <[number, Promise<GAFRD[]>]> [tabId, framesPromise];
			});
			const framePromises = entriesToObject(framePromiseEntries);
			return <snapshot> <any> ZalgoPromise.hash({tabs, framePromises});
		});
};