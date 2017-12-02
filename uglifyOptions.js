"use strict";

module.exports = {
	compress: {
		ecma: 8,
		hoist_props: true,
		keep_fargs: false,
		passes: 2,
		pure_getters: true,
		unsafe: true,
		unsafe_arrows: true,
		unsafe_methods: true,
		unsafe_proto: true,
		warnings: true,
	},
	mangle: {
		properties: {
			regex: /^(?:minArgs|maxArgs)$/, // for webextension-polyfill
		}
	},
	output: {
		beautify: false,
		ecma: 8,
	},
};