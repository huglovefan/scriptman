"use strict";

{

const {dev, prod} = require("./env");

// https://github.com/mishoo/UglifyJS2/tree/harmony#api-reference

module.exports = {
	ecma: 8,
	warnings: true,
	parse: {
		bare_returns: false,
		ecma: 8,
		html5_comments: false,
		shebang: false,
	},
	compress: {
		arrows: true,
		booleans: true,
		collapse_vars: true,
		comparisons: true,
		computed_props: true,
		conditionals: true,
		dead_code: true,
		drop_console: !dev,
		drop_debugger: !dev,
		ecma: 8,
		evaluate: true,
		expression: false,
		global_defs: {},
		hoist_funs: true,
		hoist_props: true,
		hoist_vars: true,
		if_return: true,
		inline: true,
		join_vars: true,
		keep_classnames: false,
		keep_fargs: false,
		keep_fnames: false,
		keep_infinity: false,
		loops: true,
		negate_iife: true,
		// passes  time  size
		//      1  11s   99863b
		//      2  13s   98448b
		//      3  14s   98095b
		//      4  16s   98089b
		passes: dev ? 0 : 3,
		properties: true,
		pure_funcs: null,
		pure_getters: true,
		reduce_funcs: true,
		reduce_vars: true,
		sequences: true,
		side_effects: true,
		switches: true,
		toplevel: false,
		top_retain: null,
		typeofs: true,
		unsafe: true,
		unsafe_arrows: true,
		unsafe_comps: true,
		unsafe_math: true,
		unsafe_methods: true,
		unsafe_proto: true,
		unsafe_regexp: true,
		unused: true,
		warnings: true,
	},
	mangle: dev ? false :  {
		eval: true,
		keep_classnames: false,
		keep_fnames: false,
		properties: {
			builtins: false,
			debug: false,
			keep_quoted: false,
			regex: /^(?:minArgs|maxArgs)$/, // for webextension-polyfill
			reserved: [],
		},
		reserved: [],
		toplevel: false,
		//safari10: false,
	},
	output: {
		ascii_only: false,
		beautify: dev,
		bracketize: dev ? true : false,
		comments: false,
		ecma: 8,
		indent_level: 4,
		indent_start: 0,
		inline_script: false,
		keep_quoted_props: false,
		max_line_len: false,
		preamble: null,
		preserve_line: false,
		quote_keys: false,
		quote_style: 0,
		//safari10: false,
		semicolons: true,
		shebang: false,
		webkit: false,
		width: Infinity,
		wrap_iife: false,
	},
	sourceMap: false,
	toplevel: false,
	nameCache: {},
	ie8: false,
	keep_classnames: false,
	keep_fnames: false,
	//safari10: false,
};

}