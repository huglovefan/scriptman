//
// cache to avoid repetitive URL parsing
//

import {CacheMap} from "./CacheMap";
import {ReadonlyURL} from "./ReadonlyURL";

export const URLCache = new class extends CacheMap<string, ReadonlyURL> {
	msTimeToLive = 10000;
	maxSize = 20;
	protected getItem (url: string) {
		return new URL(url);
	}
};