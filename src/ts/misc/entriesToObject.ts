//
// converts the output of "Object.entries" back to an object
//

// tslint:disable:only-arrow-functions
export function entriesToObject <K extends string, V> (entries: ReadonlyArray<[K, V]>): {[key in K]: V};
export function entriesToObject <K extends number, V> (entries: ReadonlyArray<[K, V]>): {[key: number]: V};

export function entriesToObject (entries: ReadonlyArray<[PropertyKey, any]>) {
	const result: any = {};
	for (const [k, v] of entries) {
		result[k] = v;
	}
	return result;
}
// tslint:enable:only-arrow-functions