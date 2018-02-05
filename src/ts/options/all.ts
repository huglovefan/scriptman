import {getScriptManager} from "../misc/getBackgroundPage";

export const sel = <
	TTagName extends keyof HTMLElementTagNameMap
> (tagName: TTagName, selector: string, scope: NodeSelector) => {
	return select<TTagName>(tagName + selector, scope);
};

export const selAll = <
	TTagName extends keyof HTMLElementTagNameMap
> (tagName: TTagName, selector: string, scope: NodeSelector) => {
	return selectAll<TTagName>(tagName + selector, scope);
};

// tslint:disable only-arrow-functions
function select
	<T extends keyof HTMLElementTagNameMap>
	(selector: T, scope: NodeSelector):
	HTMLElementTagNameMap[T];

function select
	<T extends keyof HTMLElementTagNameMap>
	(selector: string, scope: NodeSelector):
	HTMLElementTagNameMap[T];

function select (selector: string, scope: NodeSelector) {
	const result = scope.querySelector(selector);
	if (result === null) {
		throw new Error("Element not found");
	}
	// require typed overloads to use
	return <never> result;
}

function selectAll
	<T extends keyof HTMLElementTagNameMap>
	(selector: T, scope: NodeSelector):
	NodeListOf<HTMLElementTagNameMap[T]>;

function selectAll
	<T extends keyof HTMLElementTagNameMap>
	(selector: string, scope: NodeSelector):
	NodeListOf<HTMLElementTagNameMap[T]>;

function selectAll (selector: string, scope: NodeSelector) {
	const result = scope.querySelectorAll(selector);
	return <NodeListOf<HTMLElement>> result;
}
// tslint:enable only-arrow-functions

// tslint:disable only-arrow-functions
export function createElement
	<T extends keyof HTMLElementTagNameMap>
	(tagName: T, properties: object | null, ...children: (string | Node)[]):
	HTMLElementTagNameMap[T];

export function createElement (tagName: string, properties: object | null = null, ...children: (string | Node)[]) {
	const element = document.createElement(tagName);
	if (properties !== null) Object.assign(element, properties);
	if (children.length !== 0) element.append(...children);
	return element;
}
// tslint:enable only-arrow-functions

export {getScriptManager};

export const documentLoaded = <T = void> (x?: T) =>
	new Promise<T>((resolve) => {
		if (document.readyState !== "loading") {
			resolve(x);
		} else {
			document.addEventListener("DOMContentLoaded", () => resolve(x), {once: true});
		}
	});

type EventRaceList =
	[EventTarget, string] |
	[EventTarget, string, string] |
	[EventTarget, string, string, string] |
	[EventTarget, string, string, string, string] |
	[EventTarget, string, string, string, string, string] |
	[EventTarget, string, string, string, string, string, string] |
	[EventTarget, string, string, string, string, string, string, string] |
	[EventTarget, string, string, string, string, string, string, string, string];

export const eventRace = (...lists: EventRaceList[]) => {
	return new Promise<Event>((resolve) => {
		const callback = (event: Event) => {
			resolve(event);
			for (const [target, ...events] of lists) {
				for (const event of <string[]> events) {
					target.removeEventListener(event, callback);
				}
			}
		};
		for (const [target, ...events] of lists) {
			for (const event of <string[]> events) {
				target.addEventListener(event, callback);
			}
		}
	});
};