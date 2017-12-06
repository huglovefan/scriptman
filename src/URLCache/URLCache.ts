import CacheMap from "./CacheMap";
import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";

export default new class URLCache extends CacheMap<string, ReadonlyURL> {
	
	protected getItem (url: string) {
		return new URL(url);
	}
};