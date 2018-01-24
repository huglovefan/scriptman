import {ReadonlyURL} from "../misc/ReadonlyURL";
import {CacheMap} from "./CacheMap";

export const URLCache = new CacheMap<string, ReadonlyURL>((url) => new ReadonlyURL(url), {
	maxSize: 10,
	timeToLive: 10000,
});