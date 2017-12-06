export default interface ReadonlyURLSearchParams {
	entries (): IterableIterator<[string, string]>;
	get (name: string): string | null;
	getAll (name: string): string[];
	has (name: string): boolean;
	keys (): IterableIterator<string>;
	toString (): string;
	values (): IterableIterator<string>;
	[Symbol.iterator]: ReadonlyURLSearchParams["entries"];
}