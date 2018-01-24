import {FIREFOX} from "../browser/browser";
import {hrefNoHash} from "../misc/hrefNoHash";
import {isBackgroundPage} from "../misc/isBackgroundPage";
import {ReadonlyURL} from "../misc/ReadonlyURL";

console.assert(isBackgroundPage());

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
	public static from (init: AnyMatchInit): AnyMatch {
		switch (init.type) {
			case "domain":
				return new DomainMatch(init);
			case "regex":
				return new RegexMatch(init);
			default:
				throw new Error(`Unknown match type ${init!.type}`);
		}
	}
	public readonly value: string;
	public constructor (init: MatchInit<TType>) {
		this.value = init.value;
	}
	public abstract test (url: ReadonlyURL): boolean;
	public abstract toMatchPatterns (): string[] | null;
	/** https://developer.chrome.com/extensions/events#type-UrlFilter */
	public abstract toUrlFilters (): ReadonlyArray<chrome.events.UrlFilter>;
}

//
//
//

interface DomainMatchInit extends MatchInit<"domain"> {
}

class DomainMatch extends Match<"domain"> {
	public test (url: ReadonlyURL) {
		return ("." + url.hostname).endsWith("." + this.value);
	}
	public toMatchPatterns () {
		return [
			`*://${this.value}/*`,
			`*://*.${this.value}/*`,
		];
	}
	public toUrlFilters (): ReadonlyArray<chrome.events.UrlFilter> {
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
	public test (url: ReadonlyURL) {
		return RegExp(this.value).test(hrefNoHash(url));
	}
	// tslint:disable-next-line:prefer-function-over-method
	public toMatchPatterns () {
		// not supported
		return null;
	}
	public toUrlFilters (): ReadonlyArray<chrome.events.UrlFilter> {
		return [{urlMatches: this.value}];
	}
}