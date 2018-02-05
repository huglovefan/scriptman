import browser from "webextension-polyfill";
import {CHROME, FIREFOX} from "../browser/browser";
import {Event} from "../misc/Event";
import {CssSection, JsSection} from "./Section";
import {snapshot} from "./snapshot";

type InjectDetails = chrome.tabs.InjectDetails & {
	cssOrigin?: CssSection.CssOrigin,
	runAt?: JsSection.SnakeCaseRunAt,
};
type TabsMethodName = "executeScript" | "insertCSS" | "removeCSS";
type TabsMethod = (tabId: number, injectDetails: InjectDetails) => Promise<any>;

// tslint:disable:no-magic-numbers
const supportsCssOrigin =
	FIREFOX ? FIREFOX.equalOrNewer([53]) :
	CHROME ? CHROME.equalOrNewer([66, 0, 3326, 0]) :
	false;
// tslint:enable:no-magic-numbers
console.log("supportsCssOrigin: %o", supportsCssOrigin);

const supportsRemoveCSS = typeof browser.tabs.removeCSS === "function";
console.log("supportsRemoveCSS: %o", supportsRemoveCSS);

const fixInjectDetails = ({cssOrigin, ...injectDetails}: InjectDetails) => {
	if (supportsCssOrigin) {
		(<InjectDetails> injectDetails).cssOrigin = cssOrigin;
	}
	return <InjectDetails> injectDetails;
};

export abstract class Injection {
	public static readonly isStatic: boolean | null = null;
	public static readonly canRemove: boolean | null = null;
	private readonly injectDetails: InjectDetails;
	public readonly onInjected: Event<{tabId: number, frameId: number}>;
	public readonly onRemoved: Event<{tabId: number, frameId: number}>;
	public constructor (injectDetails: Readonly<InjectDetails>) {
		this.injectDetails = fixInjectDetails(injectDetails);
		this.onInjected = new Event();
		this.onRemoved = new Event();
	}
	protected async callTabsAPI (methodName: TabsMethodName, tabId: number, frameId: number, isInjection: boolean) {
		const method: TabsMethod | undefined = browser.tabs[methodName];
		if (method === undefined) {
			return false;
		}
		this.injectDetails.frameId = frameId;
		try {
			await method(tabId, this.injectDetails);
			const event = (isInjection) ? this.onInjected : this.onRemoved;
			event.dispatch({tabId, frameId});
			return true;
		} catch (error) {
			return false;
		}
	}
	public async removeAll () {
		if (!(<typeof Injection> this.constructor).canRemove) {
			return;
		}
		const {tabs, frames} = await snapshot();
		for (const tab of tabs) {
			const tabId = tab.id!;
			for (const frame of frames[tabId]) {
				const frameId = frame.frameId;
				this.remove(tabId, frameId);
			}
		}
	}
	public abstract inject (tabId: number, frameId: number): PromiseLike<boolean>;
	public abstract remove (tabId: number, frameId: number): PromiseLike<boolean>;
}

export class CssInjection extends Injection {
	public static readonly isStatic = true;
	public static readonly canRemove = supportsRemoveCSS;
	public async inject (tabId: number, frameId: number) {
		return await super.callTabsAPI("insertCSS", tabId, frameId, true);
	}
	public async remove (tabId: number, frameId: number) {
		if (!supportsRemoveCSS) {
			return false;
		}
		return await super.callTabsAPI("removeCSS", tabId, frameId, false);
	}
}

export class JsInjection extends Injection {
	public static readonly isStatic = false;
	public static readonly canRemove = false;
	public async inject (tabId: number, frameId: number) {
		return await super.callTabsAPI("executeScript", tabId, frameId, true);
	}
	// tslint:disable-next-line:prefer-function-over-method
	public async remove (_tabId: number, _frameId: number) {
		// not supported
		return false;
	}
}