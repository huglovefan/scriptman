import ReadonlyURLSearchParams from "./ReadonlyURLSearchParams";

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

export default ReadonlyURL;