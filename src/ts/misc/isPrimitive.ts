export type primitive = string | number | boolean | symbol | null | undefined;

export const isPrimitive = (x: any): x is primitive => {
	return Object(x) !== x;
};