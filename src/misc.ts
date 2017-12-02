import {ReadonlyURL} from "./background/ReadonlyURL";

export const hrefNoHash = (url: ReadonlyURL) =>
	(url.hash !== "") ?
		url.href.slice(0, -url.hash.length) :
		url.href;