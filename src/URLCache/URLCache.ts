import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";
import CacheMap from "./CacheMap";

export default new class URLCache extends CacheMap<string, ReadonlyURL> {
	
	// tslint:disable-next-line:prefer-function-over-method
	protected getItem (url: string) {
		return new ReadonlyURL(url);
	}
};