import {isPrimitive} from "./isPrimitive";

export function isPlainObject (x: any) {
	return !isPrimitive(x) && Object.getPrototypeOf(x) === Object.prototype;
}