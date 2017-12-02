import {ReadonlyURL} from "./background/ReadonlyURL";

export const hrefNoHash = (url: ReadonlyURL) =>
	(url.hash !== "") ?
		url.href.slice(0, -url.hash.length) :
		url.href;

// https://github.com/benjamingr/RegExp.escape/blob/master/polyfill.js
export const escapeRegExp = (s: string) =>
	s.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");