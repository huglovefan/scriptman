import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import {Event} from "../misc/Event";
import {returnFalse} from "../misc/returnConstants";

type InjectDetails = chrome.tabs.InjectDetails & {cssOrigin?: "user" | "author"};
type TabsAPI = "executeScript" | "insertCSS" | "removeCSS";

export abstract class Injection {
	private readonly injectDetails: InjectDetails;
	public readonly onInjected: Event<{tabId: number, frameId: number}>;
	public readonly onRemoved: Event<{tabId: number, frameId: number}>;
	public constructor (injectDetails: InjectDetails) {
		this.injectDetails = injectDetails;
		this.onInjected = new Event();
		this.onRemoved = new Event();
	}
	protected callTabsAPI (methodName: TabsAPI, tabId: number, frameId: number, isInjection: boolean) {
		const method = <(...args: any[]) => Promise<any>> browser.tabs[methodName];
		if (method === undefined) {
			return ZalgoPromise.resolve(false);
		}
		this.injectDetails.frameId = frameId;
		return method(tabId, this.injectDetails)
			.then(() => {
				const event = (isInjection) ? this.onInjected : this.onRemoved;
				event.dispatch({tabId, frameId});
				return true;
			}, returnFalse);
	}
	public abstract inject (tabId: number, frameId: number): PromiseLike<boolean>;
	public abstract remove (tabId: number, frameId: number): PromiseLike<boolean>;
}

export class CssInjection extends Injection {
	public inject (tabId: number, frameId: number) {
		return super.callTabsAPI("insertCSS", tabId, frameId, true);
	}
	public remove (tabId: number, frameId: number) {
		return super.callTabsAPI("removeCSS", tabId, frameId, false);
	}
}

export class JsInjection extends Injection {
	public inject (tabId: number, frameId: number) {
		return super.callTabsAPI("executeScript", tabId, frameId, true);
	}
	// tslint:disable-next-line:prefer-function-over-method
	public remove (_tabId: number, _frameId: number) {
		// not supported
		return Promise.resolve(false);
	}
}