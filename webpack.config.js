"use strict";

const path = require("path");
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");

const dev = (process.env.NODE_ENV === "development");
const prod = (process.env.NODE_ENV === "production");
console.assert(dev ^ prod);

// https://github.com/webpack/webpack/issues/4453

const uglifyOptions = require("./uglifyOptions.js");

module.exports = {
	entry: {
		
		// background
		background: "./src/background/background.ts",
		
		// options
		scripts: "./src/options/scripts.ts",
		xport: "./src/options/xport.ts",
		editor: "./src/options/editor.ts",
		
		// options but not really
		syntaxCheckFrame: "./src/options/editor/syntaxCheckFrame.ts",
	},
	module: {
		rules: [
			{
				test: /\.ts$/i,
				loader: "ts-loader",
				options: {
					appendTsSuffixTo: [
						/\.vue$/i,
					]
				}
			},
			{
				test: /\.vue$/i,
				loader: "vue-loader",
				options: {
					esModule: true,
					extract: false,
					loaders: {
						ts: "ts-loader"
					}
				}
			}
		],
	},
	resolve: {
		extensions: [
			".ts",
			".js",
			".vue",
		],
	},
	plugins: [
		new webpack.EnvironmentPlugin(["NODE_ENV"]),
		new CommonsChunkPlugin({
			name: "commons-background-options",
			chunks: [
				"background",
				"scripts",
				"xport",
				"editor",
			],
		}),
		new CommonsChunkPlugin({
			name: "commons-options",
			chunks: [
				"scripts",
				"xport",
				"editor",
			],
		}),
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.AggressiveMergingPlugin(),
		...(prod ? [new webpack.optimize.ModuleConcatenationPlugin()] : []),
		...(prod ? [new UglifyJsPlugin({uglifyOptions})] : []),
	],
	output: {
		path: path.resolve(__dirname, "dist/extension/js"),
		filename: "[name].js",
	},
};