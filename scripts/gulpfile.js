"use strict";

{

const gulp = require("gulp");
const gutil = require("gulp-util");
const webpack = require("webpack");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es").default;
const cleanCSS = require("gulp-clean-css");
const exports2json = require("gulp-exports2json");
const zip = require("gulp-zip");
const gulpTslint = require("gulp-tslint");
const tslint = require("tslint");
const sequence = require("gulp-sequence");

const fs = require("fs");
const requireUncached = require("require-uncached");

const {dev, prod} = require("./env");

// https://github.com/gulpjs/gulp/blob/master/docs/API.md

gulp.task("tslint", () => {
	return gulp.src("../src/ts/**/*.ts")
		.pipe(gulpTslint({
			configuration: "../src/ts/tslint.json",
			formatter: "stylish",
			program: tslint.Linter.createProgram("../src/ts/tsconfig.json"),
		}))
		.pipe(gulpTslint.report({
			allowWarnings: false,
			summarizeFailureOutput: true,
		}));
});

gulp.task("webpack", (callback) => {
	webpack(requireUncached("./webpack.config.js"), (err, stats) => {
		if (err) {
			callback(err);
			return;
		}
		gutil.log("[webpack]", stats.toString({colors: true}));
		callback();
	});
});

gulp.task("static-scripts", () => {
	return gulp.src(["!../static/manifest.js", "../static/**/*.js"])
		.pipe(uglify(requireUncached("./uglifyOptions.js")))
		.pipe(gulp.dest("../dist/extension/"));
});

gulp.task("html", () => {
	return gulp.src("../static/**/*.html")
		.pipe(htmlmin({
			collapseWhitespace: prod,
			minifyCSS: prod,
		}))
		.pipe(gulp.dest("../dist/extension/"));
});

gulp.task("css", () => {
	return gulp.src("../static/**/*.css")
		.pipe(cleanCSS({
			...(!prod ? {format: "beautify"} : {}),
		}))
		.pipe(gulp.dest("../dist/extension/"));
});

gulp.task("manifest", () => {
	return gulp.src("../static/manifest.js")
		.pipe(exports2json())
		.pipe(gulp.dest("../dist/extension/"));
});

gulp.task("watch", () => {
	gulp.watch([
		"./webpack.config.js",
		"./uglifyOptions.js",
		"../src/ts/**/*.ts", "../src/ts/**/*.vue"
	], ["webpack"]);
	gulp.watch(["!../static/manifest.js", "../static/**/*.js"], ["static-scripts"]);
	gulp.watch("../static/**/*.html", ["html"]);
	gulp.watch("../static/**/*.css", ["css"]);
	gulp.watch("../static/manifest.js", ["manifest"]);
});

gulp.task("default", sequence(
	["tslint", "webpack", "static-scripts", "html", "css", "manifest"],
	...(dev ? ["watch"] : []),
));

gulp.task("zip", () => {
	return gulp.src("../dist/extension/**")
		.pipe(zip("extension.zip"))
		.pipe(gulp.dest("../dist/"));
});

}