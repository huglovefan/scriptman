import browser from "webextension-polyfill";
import isBackgroundPage from "../misc/isBackgroundPage";

console.assert(isBackgroundPage());

// https://crbug.com/632009
type InjectDetails = chrome.tabs.InjectDetails & {cssOrigin?: "user" | "author"};

// https://crbug.com/608854
type TabsAPI = keyof typeof chrome.tabs | "removeCSS";

export abstract class Injection {
	protected readonly injectDetails: InjectDetails;
	public constructor (injectDetails: Readonly<InjectDetails>) {
		this.injectDetails = injectDetails;
	}
	public abstract inject (tabId: number, frameId: number): Promise<boolean>;
	public abstract remove (tabId: number, frameId: number): Promise<boolean>;
	protected async callTabsAPI (method: TabsAPI, tabId: number, frameId: number) {
		try {
			this.injectDetails.frameId = frameId;
			await browser.tabs[method](tabId, this.injectDetails);
		} catch (error) {
			return false;
		}
		return true;
	}
}

export class CssInjection extends Injection {
	public async inject (tabId: number, frameId: number) {
		return super.callTabsAPI("insertCSS", tabId, frameId);
	}
	public async remove (tabId: number, frameId: number) {
		return super.callTabsAPI("removeCSS", tabId, frameId);
	}
}

export class JsInjection extends Injection {
	public async inject (tabId: number, frameId: number) {
		return super.callTabsAPI("executeScript", tabId, frameId);
	}
	// tslint:disable-next-line:prefer-function-over-method
	public async remove () {
		// not supported
		return false;
	}
}