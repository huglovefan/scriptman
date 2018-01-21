import isPrimitive from "./isPrimitive";

export default function isPlainObject (x: any) {
	return !isPrimitive(x) && Object.getPrototypeOf(x) === Object.prototype;
}