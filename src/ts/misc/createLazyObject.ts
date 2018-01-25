import {lazyGetter} from "./lazyGetter";
import {mapObject} from "./mapObject";

export const createLazyObject = <
	K extends string,
	V
> (
	proto: object | null,
	getters: {[key in K]: (key: K) => V}
) => {
	const descriptors = mapObject(getters, lazyGetter);
	const object = Object.create(proto, descriptors);
	return <{[key in K]: V}> object;
};