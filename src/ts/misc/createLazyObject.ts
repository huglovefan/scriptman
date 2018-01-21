import lazyGetter from "./lazyGetter";
import mapObject from "./mapObject";

export default <K extends string, V> (proto: object | null, obj: {[key in K]: (key: K) => V}) => {
	const descriptors = mapObject(obj, lazyGetter);
	const object = Object.create(proto, descriptors);
	return <{[key in K]: V}> object;
};