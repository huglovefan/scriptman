//
// automatic workaround for https://crbug.com/373579
//

import {CHROME} from "../browser/browser";
import DefaultWeakMap from "../misc/DefaultWeakMap";

const fix = () => {
	
	const wrapCallback = <T extends (...args: any[]) => any> (callback: T) => {
		let lastTimeStamp = 0;
		return function (details: {timeStamp: number}) {
			if (details.timeStamp === lastTimeStamp) {
				return;
			}
			lastTimeStamp = details.timeStamp;
			return callback(...arguments);
		};
	};
	
	const fixEvent = <T extends chrome.webNavigation.WebNavigationEvent<any>> (event: T) => {
		const callbacks = new DefaultWeakMap(wrapCallback);
		return <T> <any> {
			__proto__: event,
			addListener (callback: (details: T) => void, ...rest: any[]) {
				event.addListener(callbacks.get(callback), ...rest);
			},
			removeListener (callback: (details: T) => void) {
				event.removeListener(callbacks.get(callback));
			},
			hasListener (callback: (details: T) => void) {
				return event.hasListener(callbacks.get(callback));
			},
		};
	};
	
	const lazyGetter = <K, V> (key: K, getValue: (key: K) => V) => ({
		get: function (this: any) {
			return this[key] = getValue(key);
		},
		set: function (this: any, value: V) {
			delete this[key];
			this[key] = value;
		},
		configurable: true,
		enumerable: true,
	});
	
	const getFixedEvent = (name: string) => fixEvent((<any> chrome).webNavigation[name]);
	
	return <typeof chrome.webNavigation> Object.create(chrome.webNavigation, {
		onCommitted: lazyGetter("onCommitted", getFixedEvent),
	});
};

export default (CHROME) ? fix() : chrome.webNavigation;