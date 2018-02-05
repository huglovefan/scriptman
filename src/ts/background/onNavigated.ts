import {CHROME, FIREFOX} from "../browser/browser";
import {Event} from "../misc/Event";
import {FRAME_ID_TOP} from "../misc/FRAME_ID_TOP";
import {ReadonlyURL} from "../misc/ReadonlyURL";
import {snapshot} from "./snapshot";

export type NavigationDetails = Readonly<{
	tabId: number,
	frameId: number,
	url: ReadonlyURL,
}>;

type WebNavigationDetails = chrome.webNavigation.WebNavigationTransitionCallbackDetails;
type WebRequestDetails = chrome.webRequest.WebResponseCacheDetails;

type NativeDetails =
	WebNavigationDetails |
	WebRequestDetails;

const detailsToNavigation = ({tabId, frameId, url}: NativeDetails): NavigationDetails => {
	return {
		tabId,
		frameId,
		url: new ReadonlyURL(url),
	};
};

const getChromeDuplicateEventFilter = () => {
	let lastTimeStamp = 0;
	return ({timeStamp}: WebNavigationDetails) => {
		if (timeStamp === lastTimeStamp) {
			return false;
		}
		lastTimeStamp = timeStamp;
		return true;
	};
};

// https://crbug.com/373579
// on chrome, webNavigation events fire multiple times if they have multiple listeners
const getEventsForChrome = () => {
	return [
		Event.fromChromeEvent(chrome.webNavigation.onCommitted)
			.filter(getChromeDuplicateEventFilter())
			.map(detailsToNavigation),
	];
};

const isTopFrameNavigation = ({frameId}: {frameId: number}) => {
	return frameId === FRAME_ID_TOP;
};

// https://github.com/greasemonkey/greasemonkey/issues/2574
// on firefox, only webNavigation does top frames reliably,
// and only webRequest does subframes reliably
const getEventsForFirefox = () => {
	const webRequestFilter = {
		types: ["sub_frame"],
		urls: ["<all_urls>"],
	};
	return [
		Event.fromChromeEvent(chrome.webNavigation.onCommitted)
			.filter(isTopFrameNavigation)
			.map(detailsToNavigation),
		Event.fromChromeEvent(chrome.webRequest.onResponseStarted, webRequestFilter)
			.map(detailsToNavigation),
	];
};

// something else, assume everything works?
const getEventsForOther = () => {
	console.error("Unknown browser, not applying workarounds for browser bugs in onNavigated");
	return [
		Event.fromChromeEvent(chrome.webNavigation.onCommitted)
			.map(detailsToNavigation),
	];
};

export const onNavigated = (() => {
	const event = new Event<NavigationDetails>();
	const events =
		CHROME ? getEventsForChrome() :
		FIREFOX ? getEventsForFirefox() :
		getEventsForOther();
	event.absorb(events);
	return event;
})();

export const dispatchOldNavigations = async () => {
	const {tabs, frames} = await snapshot();
	for (const tab of tabs) {
		const tabId = tab.id!;
		for (const frame of frames[tabId]) {
			const frameId = frame.frameId;
			const url = new ReadonlyURL(frame.url);
			onNavigated.dispatch({tabId, frameId, url});
		}
	}
};