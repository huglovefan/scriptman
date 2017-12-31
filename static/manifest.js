"use strict";

const npmPackage = require("../package.json");

console.assert(npmPackage);

const dev = (process.env.NODE_ENV === "development");
const prod = (process.env.NODE_ENV === "production");
console.assert(dev ^ prod);

const nameSuffix = (dev) ? " (dev)" : "";

// https://developer.chrome.com/extensions/manifest
// https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json

module.exports = {
	manifest_version: 2,
	name: npmPackage.name + nameSuffix,
	version: npmPackage.version,
	description: npmPackage.description,
	homepage_url: npmPackage.homepage,
	options_ui: {
		page: "options/scripts.html",
		open_in_tab: true,
	},
	browser_action: {
		default_popup: "options/scripts.html?popup=1",
	},
	content_scripts: [
		{
			matches: ["<all_urls>"],
			match_about_blank: true,
			js: ["content/commandlineapi.js"],
			run_at: "document_start",
			all_frames: true,
		}
	],
	background: {
		scripts: [
			"js/commons-background-options.js",
			"js/background.js",
		]
	},
	permissions: [
		"<all_urls>",
		"storage",
		"tabs",
		"webNavigation",
		"webRequest",
	],
	// required for syntax checking
	content_security_policy: "script-src 'self' blob:; object-src 'self'",
};