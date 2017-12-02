//
// browser detection & version comparison
//

class VersionNumber {
	
	static fromString (input: string) {
		return new VersionNumber(input.split(".").map(Number));
	}
	
	private readonly numbers: ReadonlyArray<number>;
	
	constructor (numbers: ReadonlyArray<number>) {
		this.numbers = numbers;
	}
	
	compare (numbers: ReadonlyArray<number>) {
		const length = Math.max(numbers.length, this.numbers.length);
		for (var i = 0; i < length; i++) {
			if (numbers[i] > this.numbers[i]) return 1;
			if (this.numbers[i] > numbers[i]) return -1;
		}
		return 0;
	}
	
	isOlderThan (numbers: ReadonlyArray<number>) {
		return this.compare(numbers) === 1;
	}
	
	isNewerThan (numbers: ReadonlyArray<number>) {
		return this.compare(numbers) === -1;
	}
}

const parseBrowser = (re: RegExp) => {
	const match = re.exec(navigator.userAgent);
	if (match === null || !match[1]) {
		return null;
	}
	return VersionNumber.fromString(match[1]);
};

export const CHROME = parseBrowser(/\bChrome\/([^ ]+)/i);
export const FIREFOX = parseBrowser(/\bFirefox\/([^ ]+)/i);