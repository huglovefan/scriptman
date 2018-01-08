"use strict";

const gulp = require("gulp");
const gutil = require("gulp-util");
const webpack = require("webpack");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es").default;
const cleanCSS = require("gulp-clean-css");
const exports2json = require("gulp-exports2json");
const zip = require("gulp-zip");
const tslint = require("gulp-tslint");
const sequence = require("gulp-sequence");

const fs = require("fs");
const requireUncached = require("require-uncached");

const {dev, prod} = require("./modules/env");

// https://github.com/gulpjs/gulp/blob/master/docs/API.md

gulp.task("tslint", () => {
	return gulp.src("../src/**/*.ts")
		.pipe(tslint(requireUncached("../src/tslint.json")))
		.pipe(tslint.report());
});

gulp.task("scripts", (callback) => {
	webpack(requireUncached("./webpack.config.js"), (err, stats) => {
		if (err) {
			throw new gutil.PluginError("webpack", err);
		}
		gutil.log("[webpack]", stats.toString());
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
		"../src/**/*.ts", "../src/**/*.vue"
	], ["scripts"]);
	gulp.watch(["!../static/manifest.js", "../static/**/*.js"], ["static-scripts"]);
	gulp.watch("../static/**/*.html", ["html"]);
	gulp.watch("../static/**/*.css", ["css"]);
	gulp.watch("../static/manifest.js", ["manifest"]);
});

gulp.task("default", sequence(
	["tslint", "scripts", "static-scripts", "html", "css", "manifest"],
	...(dev ? ["watch"] : []),
));

gulp.task("zip", () => {
	return gulp.src("../dist/extension/**")
		.pipe(zip("extension.zip"))
		.pipe(gulp.dest("../dist/"));
});