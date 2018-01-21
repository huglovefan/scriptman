//
// automatic workaround for https://crbug.com/373579
//

import {CHROME} from "../browser/browser";
import createLazyObject from "../misc/createLazyObject";
import DefaultWeakMap from "../misc/DefaultWeakMap";
import entriesToObject from "../misc/entriesToObject";
import isBackgroundPage from "../misc/isBackgroundPage";

console.assert(isBackgroundPage());

type WebNavigationEventName =
	"onBeforeNavigate" |
	"onCommitted" |
	"onCompleted" |
	"onCreatedNavigationTarget" |
	"onDOMContentLoaded" |
	"onErrorOccurred" |
	"onHistoryStateUpdated" |
	"onReferenceFragmentUpdated" |
	"onTabReplaced";

type AnyWebNavigationEvent =
	typeof chrome.webNavigation[WebNavigationEventName];

type WebNavigationEventFilter =
	chrome.webNavigation.WebNavigationEventFilter;

type CallbackDetails =
	chrome.webNavigation.WebNavigationFramedCallbackDetails |
	chrome.webNavigation.WebNavigationFramedErrorCallbackDetails |
	chrome.webNavigation.WebNavigationParentedCallbackDetails |
	chrome.webNavigation.WebNavigationReplacementCallbackDetails |
	chrome.webNavigation.WebNavigationSourceCallbackDetails |
	chrome.webNavigation.WebNavigationTransitionCallbackDetails;

type WebNavigationCallback = (details: CallbackDetails) => void;

interface WebNavigationEventLike {
	addListener (callback: WebNavigationCallback, filters?: WebNavigationEventFilter): void;
	removeListener (callback: WebNavigationCallback): void;
	hasListener (callback: WebNavigationCallback): boolean;
}

const webNavigationEventNames: ReadonlyArray<WebNavigationEventName> = [
	"onBeforeNavigate",
	"onCommitted",
	"onCompleted",
	"onCreatedNavigationTarget",
	"onDOMContentLoaded",
	"onErrorOccurred",
	"onHistoryStateUpdated",
	"onReferenceFragmentUpdated",
	"onTabReplaced",
];

const fix = () => {
	
	const wrapCallback = <TCallback extends WebNavigationCallback> (callback: TCallback) => {
		let lastTimeStamp = 0;
		return <TCallback> ((details) => {
			if (details.timeStamp === lastTimeStamp) {
				return;
			}
			lastTimeStamp = details.timeStamp;
			callback(details);
		});
	};
	
	// todo: was this bad to have here globally for all events?
	const callbacks = new DefaultWeakMap<WebNavigationCallback, WebNavigationCallback>(wrapCallback);
	
	const fixEvent = <TEvent extends AnyWebNavigationEvent> (event: TEvent) => {
		return <TEvent> <WebNavigationEventLike> {
			__proto__: event,
			addListener (callback: WebNavigationCallback, filters?: WebNavigationEventFilter) {
				(<WebNavigationEventLike> event).addListener(callbacks.get(callback), filters);
			},
			removeListener (callback: WebNavigationCallback) {
				(<WebNavigationEventLike> event).removeListener(callbacks.get(callback));
			},
			hasListener (callback: WebNavigationCallback) {
				return (<WebNavigationEventLike> event).hasListener(callbacks.get(callback));
			},
		};
	};
	
	const getFixedEvent = <TName extends WebNavigationEventName> (name: TName) => {
		return fixEvent(chrome.webNavigation[name]);
	};
	
	const lazyEntries = webNavigationEventNames.map((name) =>
		<[typeof name, (key: typeof name) => typeof chrome.webNavigation[typeof name]]>
		[name, getFixedEvent]);
	
	// todo: why can't it get the type right
	return <typeof chrome.webNavigation> <any> createLazyObject(chrome.webNavigation, entriesToObject(lazyEntries));
};

export default (CHROME) ? fix() : chrome.webNavigation;