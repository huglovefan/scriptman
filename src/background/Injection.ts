import browser from "webextension-polyfill";

// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/new
type InjectDetails = chrome.tabs.InjectDetails & {cssOrigin?: string};

export abstract class Injection {
	protected readonly injectDetails: chrome.tabs.InjectDetails;
	constructor (injectDetails: Readonly<InjectDetails>) {
		this.injectDetails = injectDetails;
	}
	abstract inject (tabId: number, frameId: number): Promise<boolean>;
	abstract remove (tabId: number, frameId: number): Promise<boolean>;
	protected async callTabsAPI (tabId: number, frameId: number, method: keyof typeof chrome.tabs) {
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
	async inject (tabId: number, frameId: number) {
		return super.callTabsAPI(tabId, frameId, "insertCSS");
	}
	async remove (tabId: number, frameId: number) {
		// https://crbug.com/608854
		return super.callTabsAPI(tabId, frameId, <any> "removeCSS");
	}
}

export class JsInjection extends Injection {
	async inject (tabId: number, frameId: number) {
		return super.callTabsAPI(tabId, frameId, "executeScript");
	}
	async remove () {
		// not supported
		return false;
	}
}