export const once = <T> (callback: () => T) => {
	let done = false;
	let value: T;
	return () => {
		if (!done) {
			value = callback();
			done = true;
		}
		return value;
	};
};