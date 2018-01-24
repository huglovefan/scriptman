export interface ReadonlyURLSearchParams {
	entries (): IterableIterator<[string, string]>;
	get (name: string): string | null;
	getAll (name: string): string[];
	has (name: string): boolean;
	keys (): IterableIterator<string>;
	toString (): string;
	values (): IterableIterator<string>;
	[Symbol.iterator]: ReadonlyURLSearchParams["entries"];
}

interface ReadonlyURL {
	readonly hash: string;
	readonly host: string;
	readonly hostname: string;
	readonly href: string;
	readonly origin: string;
	readonly password: string;
	readonly pathname: string;
	readonly port: string;
	readonly protocol: string;
	readonly search: string;
	readonly searchParams: ReadonlyURLSearchParams;
	readonly username: string;
	toString (): string;
}

const ReadonlyURL: {
	new (url: string, base?: string): ReadonlyURL;
	prototype: ReadonlyURL;
} = <any> URL;

export {ReadonlyURL};