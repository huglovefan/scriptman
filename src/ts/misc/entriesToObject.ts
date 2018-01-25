//
// converts the output of "Object.entries" back to an object
//

export const entriesToObject = <K extends string, V> (entries: [PropertyKey, V][]) => {
	const result: any = {};
	for (const [k, v] of entries) {
		result[k] = v;
	}
	return <{[key in K]: V}> result;
};