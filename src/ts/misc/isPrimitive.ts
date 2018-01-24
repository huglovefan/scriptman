export type primitive = string | number | boolean | symbol | null | undefined;

export function isPrimitive (x: any): x is primitive {
	return Object(x) !== x;
}