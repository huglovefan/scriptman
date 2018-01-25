import {CHROME, FIREFOX} from "../browser/browser";
import {Event} from "../misc/Event";
import {FRAME_ID_TOP} from "../misc/FRAME_ID_TOP";
import {ReadonlyURL} from "../misc/ReadonlyURL";

export type NavigationDetails = Readonly<{
	tabId: number,
	frameId: number,
	url: ReadonlyURL,
}>;

export const onNavigated = (() => {
	const event = new Event<NavigationDetails>();
	// https://crbug.com/373579
	// on chrome, webNavigation events fire multiple times if they have multiple listeners
	if (CHROME) {
		let lastTimeStamp = 0;
		chrome.webNavigation.onCommitted.addListener(({tabId, frameId, url, timeStamp}) => {
			if (timeStamp === lastTimeStamp) {
				return;
			}
			lastTimeStamp = timeStamp;
			event.dispatch({tabId, frameId, url: new ReadonlyURL(url)});
		});
	}
	// https://github.com/greasemonkey/greasemonkey/issues/2574
	// on firefox, only webNavigation does top frames reliably,
	// and only webRequest does subframes reliably
	else if (FIREFOX) {
		chrome.webNavigation.onCommitted.addListener(({tabId, frameId, url}) => {
			if (tabId !== FRAME_ID_TOP) {
				return;
			}
			event.dispatch({tabId, frameId, url: new ReadonlyURL(url)});
		});
		chrome.webRequest.onResponseStarted.addListener(({tabId, frameId, url}) => {
			event.dispatch({tabId, frameId, url: new ReadonlyURL(url)});
		}, {
			types: ["sub_frame"],
			urls: ["<all_urls>"],
		});
	}
	// something else, assume everything works?
	else {
		console.error("Unknown browser, not applying workarounds for browser bugs in onNavigated");
		chrome.webNavigation.onCommitted.addListener(({tabId, frameId, url}) => {
			event.dispatch({tabId, frameId, url: new ReadonlyURL(url)});
		});
	}
	return event;
})();