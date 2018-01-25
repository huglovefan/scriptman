export const lazy = <T extends any> (callback: () => T) => {
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