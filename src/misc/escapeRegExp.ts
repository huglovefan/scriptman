// https://github.com/benjamingr/RegExp.escape/blob/master/polyfill.js
export default function escapeRegExp (s: string) {
	return s.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}