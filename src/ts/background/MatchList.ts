import {ReadonlyURL} from "../misc/ReadonlyURL";
import {returnTrue} from "../misc/returnConstants";
import {AnyMatch} from "./Match";
import {NavigationDetails} from "./onNavigated";

export class MatchList {
	private readonly matches: ReadonlyArray<AnyMatch>;
	private readonly defaultValue: boolean;
	public constructor (matches: ReadonlyArray<AnyMatch>, defaultValue: boolean) {
		this.matches = matches;
		this.defaultValue = defaultValue;
	}
	public test (url: ReadonlyURL) {
		if (this.matches.length === 0) {
			return this.defaultValue;
		}
		return this.matches.some((match) => match.test(url));
	}
	public getNavigationFilter () {
		// nothing to do, just let the navigation through
		if (this.matches.length === 0) {
			return returnTrue;
		}
		return ({url}: NavigationDetails) => {
			return this.test(url) === this.defaultValue;
		};
	}
}