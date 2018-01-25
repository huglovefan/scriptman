export const isMetaKey = (key: string) => {
	return /^__[^]*__$/.test(key);
};