import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import isBackgroundPage from "../misc/isBackgroundPage";

console.assert(isBackgroundPage());

// https://crbug.com/632009
type InjectDetails = chrome.tabs.InjectDetails & {cssOrigin?: "user" | "author"};

// https://crbug.com/608854
type TabsAPI = keyof typeof chrome.tabs | "removeCSS";

const returnTrue = () => true;
const returnFalse = () => false;

export abstract class Injection {
	protected readonly injectDetails: InjectDetails;
	public constructor (injectDetails: Readonly<InjectDetails>) {
		this.injectDetails = injectDetails;
	}
	public abstract inject (tabId: number, frameId: number): PromiseLike<boolean>;
	public abstract remove (tabId: number, frameId: number): PromiseLike<boolean>;
	protected callTabsAPI (method: TabsAPI, tabId: number, frameId: number) {
		this.injectDetails.frameId = frameId;
		if (browser.tabs[method] === undefined) {
			return ZalgoPromise.resolve(false);
		}
		const happening: Promise<any> = browser.tabs[method](tabId, this.injectDetails);
		return happening.then(returnTrue, returnFalse);
	}
}

export class CssInjection extends Injection {
	public inject (tabId: number, frameId: number) {
		return super.callTabsAPI("insertCSS", tabId, frameId);
	}
	public remove (tabId: number, frameId: number) {
		return super.callTabsAPI("removeCSS", tabId, frameId);
	}
}

export class JsInjection extends Injection {
	public inject (tabId: number, frameId: number) {
		return super.callTabsAPI("executeScript", tabId, frameId);
	}
	// tslint:disable-next-line:prefer-function-over-method
	public remove () {
		// not supported
		return ZalgoPromise.resolve(false);
	}
}