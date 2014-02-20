/* jshint node: true */
"use strict";

module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: ".jshintrc"
			},
			gruntfile: {
				src: "Gruntfile.js",
			},
			lib: {
				src: ["lib/**/*.js"]
			},
			tests: {
				src: ["test/**/*.js"],
			},
			examples: {
				src: ["examples/**/*.js"]
			},
			benchmark: {
				src: ["benchmark/**/*.js"]
			}
		},
		watch: {
			gruntfile: {
				files: "<%= jshint.gruntfile.src %>",
				tasks: ["jshint:gruntfile"]
			},
			lib: {
				files: "<%= jshint.lib.src %>",
				tasks: ["jshint:lib"]
			},
		},
		simplemocha: {
			options: {
				globals: ["should"],
				timeout: 3000,
				ui: "bdd",
				reporter: "spec"
			},

			all: { src: "test/**/*.js" }
		}
	});

	// Tasks
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-simple-mocha");

	// Default task.
	grunt.registerTask("default", ["jshint"]);
	grunt.registerTask("test", ["jshint", "simplemocha"]);
};
