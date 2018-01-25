import {isPrimitive} from "./isPrimitive";

export const isPlainObject = (x: any) => {
	return !isPrimitive(x) && Object.getPrototypeOf(x) === Object.prototype;
};