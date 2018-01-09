//
// converts the output of "Object.entries" back to an object
//

export default function entriesToObject <T> (entries: [string, T][]): {[key: string]: T};
export default function entriesToObject <T> (entries: [number, T][]): {[key: number]: T};

export default function entriesToObject <T> (entries: [any, T][]) {
	const result: any = {};
	for (const [k, v] of entries) {
		result[k] = v;
	}
	return result;
}