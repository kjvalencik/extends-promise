"use strict";

const gulp      = require("gulp");
const istanbul  = require("gulp-istanbul");
const eslint    = require("gulp-eslint");
const mocha     = require("gulp-mocha");
const coveralls = require("gulp-coveralls");

const config = {
	coverage : {
		file       : "coverage/lcov.info",
		thresholds : {
			each : 100
		}
	},
	paths : {
		js : [
			"gulpfile.js",
			"index.js",
			"test/**/*.js"
		],
		tests : [
			"tests/**/*.test.js"
		]
	}
};

gulp.task("lint", () => {
	return gulp
		.src(config.paths.js)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

gulp.task("pre-test", () => {
	return gulp
		.src(config.paths.js)
		.pipe(istanbul())
		.pipe(istanbul.hookRequire());
});

gulp.task("mocha", ["pre-test"], () => {
	return gulp
		.src(config.paths.tests)
		.pipe(mocha())
		.pipe(istanbul.writeReports())
		.pipe(istanbul.enforceThresholds({
			thresholds : config.coverage.thresholds
		}));
});

gulp.task("coveralls", () => {
	return process.env.CI && gulp
		.src(config.coverage.file)
		.pipe(coveralls());
});

gulp.task("test", ["lint", "mocha"]);
gulp.task("default", ["test", "coveralls"]);
