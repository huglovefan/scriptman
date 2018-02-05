import {escapeRegExp} from "../misc/escapeRegExp";

export class VersionNumber {
	
	public static parseUserAgent (product: string, userAgent = navigator.userAgent) {
		const pattern = RegExp(
			"(?:^| )" + escapeRegExp(product) + "\\/([^ ]+)"
		);
		const match = pattern.exec(userAgent);
		if (match === null) {
			return null;
		}
		return VersionNumber.fromString(match[1]);
	}
	
	public static fromString (s: string) {
		return new VersionNumber(s.split(".").map(Number));
	}
	
	private readonly numbers: ReadonlyArray<number>;
	
	public constructor (numbers: ReadonlyArray<number>) {
		this.numbers = numbers;
	}
	
	private compare (numbers: ReadonlyArray<number>) {
		const length = Math.max(this.numbers.length, numbers.length);
		for (let i = 0; i < length; i++) {
			if (this.numbers[i] > numbers[i]) return 1;
			if (numbers[i] > this.numbers[i]) return -1;
		}
		return 0;
	}
	
	public equalOrNewer (numbers: ReadonlyArray<number>) {
		return this.compare(numbers) !== -1;
	}
}