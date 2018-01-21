//
// list of Match objects
//
// todo: is the defaultValue thing useful/correct?
// i'm unsure about how things will work when the list is empty and if i'm handling it right
//

import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";
import {AnyMatch} from "./Match";

export default class MatchList {
	
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
	
	private getGeneric <T> (methodName: "toMatchPatterns" | "toUrlFilters", matchAll: T) {
		const results: T[] = [];
		const unsupported: AnyMatch[] = [];
		for (const match of this.matches) {
			const items: T[] | null = <any> match[methodName]();
			if (items !== null) {
				results.push(...items);
			} else {
				unsupported.push(match);
			}
		}
		if (results.length === 0) {
			results.push(matchAll);
		}
		return <[T[], MatchList]> [results, new MatchList(unsupported, this.defaultValue)];
	}
	
	public getMatchPatterns () {
		return this.getGeneric<string>("toMatchPatterns", "<all_urls>");
	}
	
	public getUrlFilters () {
		return this.getGeneric<chrome.events.UrlFilter>("toUrlFilters", {});
	}
}