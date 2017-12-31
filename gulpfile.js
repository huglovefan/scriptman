"use strict";

const gulp = require("gulp");
const webpack = require("webpack-stream");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify-es").default;
const cleanCSS = require("gulp-clean-css");
const exports2json = require("gulp-exports2json");
const zip = require("gulp-zip");
const tslint = require("gulp-tslint");

const dev = (process.env.NODE_ENV === "development");
const prod = (process.env.NODE_ENV === "production");
console.assert(dev ^ prod);

// https://github.com/gulpjs/gulp/blob/master/docs/API.md

gulp.task("tslint", () => {
	return gulp.src("./src/**/*.ts")
		.pipe(tslint(require("./tslint.json")))
		.pipe(tslint.report());
});

gulp.task("scripts", () => {
	return gulp.src(["./src/**/*.ts", "./src/**/*.vue"])
		.pipe(webpack(require("./webpack.config.js")))
		.pipe(gulp.dest("./dist/extension/js/"));
});

gulp.task("static-scripts", () => {
	return gulp.src(["!./static/manifest.js", "./static/**/*.js"])
		.pipe(uglify(
			prod ? require("./uglifyOptions.js") : {
				output: {
					beautify: true,
				}
			}
		))
		.pipe(gulp.dest("./dist/extension/"));
});

gulp.task("html", () => {
	return gulp.src("./static/**/*.html")
		.pipe(htmlmin({
			collapseWhitespace: prod,
			minifyCSS: prod,
		}))
		.pipe(gulp.dest("./dist/extension/"));
});

gulp.task("css", () => {
	return gulp.src("./static/**/*.css")
		.pipe(cleanCSS({
			...(!prod ? {format: "beautify"} : {}),
		}))
		.pipe(gulp.dest("./dist/extension/"));
});

gulp.task("manifest", () => {
	return gulp.src("./static/manifest.js")
		.pipe(exports2json())
		.pipe(gulp.dest("./dist/extension/"));
});

gulp.task("watch", ["scripts", "static-scripts", "html", "css", "manifest", "zip"], () => {
	gulp.watch([
		"./webpack.config.js",
		"./uglifyOptions.js",
		"./src/**/*.ts", "./src/**/*.vue"
	], ["scripts"]);
	gulp.watch(["!./static/manifest.js", "./static/**/*.js"] ["static-scripts"]); // doesn't seem to work?
	gulp.watch("./static/**/*.html", ["html"]);
	gulp.watch("./static/**/*.css", ["css"]);
	gulp.watch("./static/manifest.js", ["manifest"]);
});

gulp.task("default", [
	"tslint", "scripts", "static-scripts", "html", "css", "manifest",
	...(dev ? ["watch"] : []),
]);

gulp.task("zip", () => {
	return gulp.src("./dist/extension/**")
		.pipe(zip("extension.zip"))
		.pipe(gulp.dest("./dist/"));
});