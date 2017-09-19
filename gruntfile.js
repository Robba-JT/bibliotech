const _ = require("lodash"),
    path = require("path");

module.exports = function (grunt) {
    require("load-grunt-tasks")(grunt, {
        "pattern": ["grunt-*", "@*/grunt-*", "grunt*-*"]
    });

    grunt.initConfig({
        "pkg": grunt.file.readJSON("package.json"),
        "jshint": {
            "client": [
                "./dev/**/*.js"
            ],
            "server": [
                "bibliotech.js",
                "cluster_bibliotech.js",
                "db/*.js",
                "api/*.js",
                "tools/*.js"
            ]
        },
        "babel": {
            "options": {
                "sourceMap": false,
                "presets": [path.join(__dirname, "./node_modules/babel-preset-es2015")]
            },
            "dist": {
                "files": [{
                    "expand": true,
                    "cwd": "./dev",
                    "src": ["**/*.es6.js"],
                    "dest": "./dev/",
                    "rename": (dest, src) => `${dest}${_.replace(src, ".es6.js", ".js")}`
                }]
            }
        },
        "uglify": {
            "options": {
                "compress": {
                    "drop_console": true
                }
            },
            "lib": {
                "files": [{
                    "expand": true,
                    "cwd": "./dev/lib",
                    "src": ["**/*.js", "!**/*.min.js", "!**/*.es6.js"],
                    "dest": "./static/lib/"
                }]
            },
            "modules": {
                "files": {
                    "./static/js/bibliotech/modules.js": (function () {
                        const out = ["./dev/js/config.js"];
                        grunt.file.recurse("./dev/modules", (abspath, rootdir, subdir, filename) => {
                            if (!_.includes(filename, ".es6.js")) {
                                out.push(`${rootdir}${subdir || "/"}${filename}`);
                            }
                        });
                        return out;
                    }()),
                    "./static/js/login/modules.js": ["./dev/js/config.js"]
                }
            },
            "login": {
                "files": {
                    "./static/js/login/main.js": ["./dev/js/login/main.js"]
                }
            },
            "bibliotech": {
                "files": {
                    "./static/js/bibliotech/main.js": ["./dev/js/bibliotech/main.js"]
                }
            }
        },
        "htmlmin": {
            "login": {
                "options": {
                    "removeComments": true,
                    "collapseWhitespace": true
                },
                "files": {
                    "./static/views/desktop/login.html": "./dev/views/desktop/login.html"
                }
            },
            "bibliotech": {
                "options": {
                    "removeComments": true,
                    "collapseWhitespace": true
                },
                "files": {
                    "./static/views/desktop/bibliotech.html": "./dev/views/desktop/bibliotech.html",
                    "./static/views/desktop/error.html": "./dev/views/desktop/error.html"
                }
            },
            "templates": {
                "options": {
                    "removeComments": true,
                    "collapseWhitespace": true
                },
                "files": [{
                    "expand": true,
                    "cwd": "./dev/templates",
                    "src": ["**/*.html"],
                    "dest": "./static/templates/"
                }]
            }
        },
        "cssmin": {
            "login": {
                "files": {
                    "./static/css/login.css": ["./dev/css/login.css"],
                    "./static/css/m.login.css": ["./dev/css/m.login.css"],
                    "./static/css/error.css": ["./dev/css/error.css"],
                    "./static/css/m.error.css": ["./dev/css/m.error.css"]
                }
            },
            "bibliotech": {
                "files": {
                    "./static/css/bibliotech.css": ["./dev/css/bibliotech.css"],
                    "./static/css/m.bibliotech.css": ["./dev/css/m.bibliotech.css"],
                    "./static/css/admin.css": ["./dev/css/admin.css"]
                }
            }
        },
        "clean": {
            "logs": [".logs/*.log"],
            "global": [
                "./static/css/*.css",
                "./static/js/**.*.js",
                "./static/modules/*.js",
                "./static/templates/*.html",
                "./static/views/**/*.html"
            ]
        },
        "supervisor": {
            "target": {
                "script": "./cluster_bibliotech.js",
                "options": {
                    "args": ["development"],
                    "ignore": ["./tmp", "./dev", "./static", "./.eslintrc.js", "./eslintignore", "./gruntfile.js"]
                }
            }
        },
        "watch": {
            "options": {
                "livereload": true
            },
            "jsserver": {
                "files": ["bibliotech.js", "cluster_bibliotech.js", "api/*.js", "db/*.js", "tools/*.js", "trads/*.json"],
                "tasks": ["jshint:server"],
                "options": {
                    "spawn": false
                }
            },
            "js": {
                "files": ["./dev/**/*.js"],
                "tasks": ["babel", "uglify"],
                "options": {
                    "spawn": false
                }
            },
            "html": {
                "files": ["./dev/**/*.html"],
                "tasks": ["htmlmin"],
                "options": {
                    "spawn": false
                }
            },
            "css": {
                "files": ["./dev/css/*.css"],
                "tasks": ["cssmin"],
                "options": {
                    "spawn": false
                }
            }
        },
        "concurrent": {
            "tasks": ["watch", "supervisor"],
            "options": {
                "logConcurrentOutput": true
            }
        }
    });

    grunt.registerTask("global", ["clean:global", "babel", "uglify", "htmlmin", "cssmin"]);
    grunt.registerTask("login", ["jshint:login", "uglify:login", "htmlmin:login", "cssmin:login"]);
    grunt.registerTask("bibliotech", [
        "jshint:bibliotech",
        "uglify:bibliotech",
        "htmlmin:bibliotech",
        "cssmin:bibliotech"
    ]);
    grunt.registerTask("dev", ["concurrent"]);
};
