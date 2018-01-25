// https://github.com/benjamingr/RegExp.escape/blob/master/polyfill.js
export const escapeRegExp = (s: string) => {
	return s.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
};