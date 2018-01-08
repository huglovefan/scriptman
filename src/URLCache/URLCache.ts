import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";
import CacheMap from "./CacheMap";

export default new CacheMap<string, ReadonlyURL>((url) => new ReadonlyURL(url), {
	maxSize: 10,
	timeToLive: 10000,
});