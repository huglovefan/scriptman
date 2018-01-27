// todo: proper type definitions exist for webextension apis,
//       but they all seem to assume `browser` is always present in global scope
//       so i can't use them only when the webextension-polyfill module is imported

declare module "webextension-polyfill" {
	interface FunctionReturningPromise {
		// tslint:disable-next-line:callable-types
		(...args: any[]): Promise<any>;
	}
	interface ObjectOfFunctionsReturningPromises {
		[key: string]: typeof browser;
	}
	const browser: FunctionReturningPromise & ObjectOfFunctionsReturningPromises;
	export default browser;
}