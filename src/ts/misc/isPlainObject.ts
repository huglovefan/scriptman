export const isPlainObject = (x: any) => {
	return (
		x != null &&
		Object.getPrototypeOf(x) === Object.prototype
	);
};