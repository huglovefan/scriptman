"use strict";

const path = require("path");
const CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const webpack = require("webpack");

const {dev, prod} = require("./modules/env");

// https://webpack.js.org/configuration/

module.exports = {
	entry: {
		
		// background
		background: "./src/ts/background/background.ts",
		
		// options
		scripts: "./src/ts/options/scripts.ts",
		xport: "./src/ts/options/xport.ts",
		editor: "./src/ts/options/editor.ts",
		
		// options but not really
		syntaxCheckFrame: "./src/ts/options/editor/syntaxCheckFrame.ts",
	},
	output: {
		path: path.resolve(__dirname, "../dist/extension/js/"),
		filename: "[name].js",
		publicPath: "/js/",
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
	performance: {
		hints: "warning",
	},
	context: path.resolve(__dirname, ".."),
	target: "web",
	stats: {
		all: true,
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
		new webpack.optimize.ModuleConcatenationPlugin(),
		new UglifyJsPlugin({
			parallel: true,
			uglifyOptions: require("./uglifyOptions.js"),
		}),
	],
};