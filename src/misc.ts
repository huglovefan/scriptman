import {ReadonlyURL} from "./background/ReadonlyURL";


export const hrefNoHash = (url: ReadonlyURL) =>
	(url.hash !== "") ?
		url.href.slice(0, -url.hash.length) :
		url.href;


// https://github.com/benjamingr/RegExp.escape/blob/master/polyfill.js
export const escapeRegExp = (s: string) =>
	s.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");


type primitive = string | symbol | number | null | undefined | void;

const isPrimitive = (value: any): value is primitive =>
	Object(value) === value;

export const clone = <T extends any> (value: T): T => {
	if (isPrimitive(value)) {
		return value;
	}
	if (Array.isArray(value)) {
		return <T> <any> Array.from(value, clone);
	}
	const result = <Partial<T>> {};
	for (const [k, v] of Object.entries(value)) {
		result[k] = clone(v);
	}
	return <T> result;
};


export const entriesToObject =
	<TValue extends any>
	(entries: [string, TValue][]) =>
	entries.reduce((result, [key, value]) => {
		result[key] = value;
		return result;
	}, <{[key: string]: TValue}> {});