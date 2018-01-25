//
// gets the ".href" of a url without the hash or fragment identifier
//

import {ReadonlyURL} from "./ReadonlyURL";

export const hrefNoHash = (url: ReadonlyURL) => {
	if (url.hash === "") {
		return url.href;
	}
	return url.href.slice(0, -url.hash.length);
};