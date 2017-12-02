import {ReadonlyURL} from "./ReadonlyURL";
import {FIREFOX} from "../browser";
import {hrefNoHash} from "../misc";

//
//
//

interface MatchInitMap {
	domain: DomainMatchInit;
	regex: RegexMatchInit;
}

interface MatchClassMap {
	domain: DomainMatch;
	regex: RegexMatch;
}

export type AnyMatchInit = MatchInitMap[keyof MatchInitMap];
export type AnyMatch = MatchClassMap[keyof MatchClassMap];

//
//
//

interface MatchInit <TType extends keyof MatchInitMap> {
	type: TType;
	value: string;
}

export abstract class Match <TType extends keyof MatchClassMap> {
	static from (init: AnyMatchInit): AnyMatch {
		switch (init.type) {
			case "domain":
				return new DomainMatch(init);
			case "regex":
				return new RegexMatch(init);
			default:
				throw new Error(`Unknown match type ${init!.type}`);
		}
	}
	readonly value: string;
	constructor (init: MatchInit<TType>) {
		this.value = init.value;
	}
	abstract test (url: ReadonlyURL): boolean;
	/** https://developer.chrome.com/extensions/events#type-UrlFilter */
	abstract toUrlFilters (): ReadonlyArray<chrome.events.UrlFilter>;
}

//
//
//

interface DomainMatchInit extends MatchInit<"domain"> {
}

class DomainMatch extends Match<"domain"> {
	test (url: ReadonlyURL) {
		return ("." + url.hostname).endsWith("." + this.value);
	}
	toUrlFilters (): ReadonlyArray<chrome.events.UrlFilter> {
		return [
			// https://bugzilla.mozilla.org/show_bug.cgi?id=1357899
			...(FIREFOX ? [{hostEquals: this.value}] : []),
			{hostSuffix: "." + this.value},
		];
	}
}

//
//
//

interface RegexMatchInit extends MatchInit<"regex"> {
}

class RegexMatch extends Match<"regex"> {
	test (url: ReadonlyURL) {
		return RegExp(this.value).test(hrefNoHash(url));
	}
	toUrlFilters (): ReadonlyArray<chrome.events.UrlFilter> {
		return [{urlMatches: this.value}];
	}
}