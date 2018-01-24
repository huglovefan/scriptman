export const mapObject = <
	K extends string,
	V1,
	V2
> (
	object: {[key in K]: V1},
	callback: (key: K, value: V1) => V2
) => {
	const result = <{[key in K]: V2}> {};
	for (const k1 in object) {
		if (!Object.prototype.hasOwnProperty.call(object, k1)) {
			continue;
		}
		result[k1] = callback(k1, object[k1]);
	}
	return result;
};