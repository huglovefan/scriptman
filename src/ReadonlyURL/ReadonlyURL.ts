import ReadonlyURLSearchParams from "./ReadonlyURLSearchParams";

export default interface ReadonlyURL {
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
	toString(): string;
}