// type definitions exist for webextensions apis,
// but i don't know how to only include them when this module is imported

declare module "webextension-polyfill" {
	const browser: any;
	export default browser;
}