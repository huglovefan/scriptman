"use strict";

const dev = (process.env.NODE_ENV === "development");
const prod = (process.env.NODE_ENV === "production");
console.assert(dev ^ prod);

module.exports = {
	manifest_version: 2,
	name: "scriptman" + (dev ? " (dev)" : ""),
	version: "0.1.6",
	description: "custom js/css manager for humans",
	homepage_url: "https://github.com/epicgirl1998/scriptman",
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