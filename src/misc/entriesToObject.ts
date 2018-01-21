//
// converts the output of "Object.entries" back to an object
//

export default function entriesToObject <K extends string, V> (entries: [PropertyKey, V][]): {[key in K]: V};

export default function entriesToObject <V> (entries: [any, V][]) {
	const result: any = {};
	for (const [k, v] of entries) {
		result[k] = v;
	}
	return result;
}