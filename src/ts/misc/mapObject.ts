export const mapObject = <
	K extends string,
	V1,
	V2
> (
	object: {[key in K]: V1},
	callback: (key: K, value: V1) => V2
) => {
	const result = <{[key in K]: V2}> {};
	for (const [k, v1] of <[K, V1][]> Object.entries(object)) {
		result[k] = callback(k, v1);
	}
	return result;
};