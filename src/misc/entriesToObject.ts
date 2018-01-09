//
// converts the output of "Object.entries" back to an object
//

export default function entriesToObject <T> (entries: [string, T][]) {
	const result: {[key: string]: T} = {};
	for (const [k, v] of entries) {
		result[k] = v;
	}
	return result;
}