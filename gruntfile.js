module.exports = function (grunt) {
    "use strict";
    require("load-grunt-tasks")(grunt);

	grunt.initConfig({
        shell: {
            options: {
                stdout: true,
                stderr: true,
                failOnError: true
            },
            mongo: {
                command: "F:/MongoDB/Server/3.0/bin/mongod --port 29017 --dbpath ../MongoDB/Data/db"
            }
        },
        express: {
            dev: {
              options: {
                script: "bibliotech.js"
              }
            },
            prod: {
              options: {
                script: "bibliotech.js",
                node_env: "production"
              }
            }
        },
        jshint: {
            login: [ "root/js/dev/bibliotech.proto.js", "root/js/dev/login.dev.js", "root/js/dev/m.login.dev.js"],
            bibliotech: [ "root/js/dev/bibliotech.proto.js", "root/js/dev/bibliotech.dev.js", "root/js/dev/m.bibliotech.dev.js"],
            server: [
                "bibliotech.js",
                "io/mainIO.js",
                "db/books.js",
                "db/users.js",
                "tools/logs.js",
                "tools/mails.js"
            ]
        },
        uglify: {
            options: {
                compress: {
                    drop_console: true
                }
            },
            loginlib: {
                files: { "root/js/login.lib.js": [
                    "node_modules/lodash/index.js",
                    "root/lib/Promise.min.js"
                ]}
            },
            login: {
                files: {
                    "root/js/login.js": [ "root/js/dev/bibliotech.proto.js", "root/js/dev/login.dev.js" ],
                    "root/js/m.login.js": [ "root/js/dev/bibliotech.proto.js", "root/js/dev/m.login.dev.js" ]
                }
            },
            bibliotechlib: {
                files: {
                    "root/js/bibliotech.lib.js": [
                        "root/lib/Promise.min.js",
                        "root/lib/color-thief.js",
                        "node_modules/lodash/index.js",
                        "node_modules/socket.io-client/socket.io.js"
                    ]
                }
            },
            bibliotech: {
                files: {
                    "root/js/bibliotech.js": [ "root/js/dev/bibliotech.proto.js", "root/js/dev/bibliotech.dev.js" ],
                    "root/js/m.bibliotech.js": [ "root/js/dev/bibliotech.proto.js", "root/js/dev/m.bibliotech.dev.js" ],
                    "root/js/images.js": [ "root/images/images.js" ]
                }
            }
        },
        htmlmin: {
            login: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "views/login.html": "root/html/login.html",
                    "views/mlogin.html": "root/html/m.login.html",
                    "views/error.html": "root/html/error.html"
                }
            },
            bibliotech: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    "views/bibliotech.html": "root/html/bibliotech.html",
                    "views/mbibliotech.html": "root/html/m.bibliotech.html",
                    "views/preview.html": "root/html/preview.html"
                }
            }
        },
        cssmin: {
            login: {
                files: {
                    "root/css/login.css": [ "root/css/dev/login.dev.css" ],
                    "root/css/m.login.css": [ "root/css/dev/m.login.dev.css" ],
                    "root/css/error.css": [ "root/css/dev/error.dev.css" ]
                }
            },
            bibliotech: {
                files: {
                    "root/css/bibliotech.css": [ "root/css/dev/bibliotech.dev.css" ],
                    "root/css/m.bibliotech.css": [ "root/css/dev/m.bibliotech.dev.css" ]
                }
            }
        },
        open: {
            dev: {
                path: "http://localhost:9876"
            },
            prod: {
                path: "http://192.168.9.27:8765"
            }
        },
        clean: [ "logs/*.log" ],
        watch: {
            options: {
                livereload: true
            },
            express: {
                files:  [ "db/*.js", "io/*.js", "tools/*.js", "bibliotech.js", "routes/*.js" ],
                tasks:  [ "express:dev" ],
                options: {
                    spawn: false
                }
            },
            jsserver: {
                files: [ "bibliotech.js", "io/mainIO.js", "db/*.js", "tools/*.js" ],
                tasks: [ "jshint:server" ],
                options: { spawn: false }
            },
            jslogin: {
                files: [ "root/js/dev/bibliotech.proto.js", "root/js/dev/login.dev.js", "root/js/dev/m.login.dev.js" ],
                tasks: [ "jshint:login", "uglify:login" ],
                options: { spawn: false }
            },
            htmllogin: {
                files: [ "root/html/login.html", "root/html/m.login.html", "root/html/error.html" ],
                tasks: [ "htmlmin:login" ],
                options: { spawn: false }
            },
            csslogin: {
                files: [ "root/css/dev/login.dev.css", "root/css/dev/m.login.dev.css", "root/css/dev/error.dev.css" ],
                tasks: [ "cssmin:login" ],
                options: { spawn: false }
            },
            jsbibliotech: {
                files: [ "root/js/dev/bibliotech.proto.js", "root/js/dev/bibliotech.dev.js", "root/js/dev/m.bibliotech.dev.js" ],
                tasks: [ "jshint:bibliotech", "uglify:bibliotech" ],
                options: { spawn: false }
            },
            htmlbibliotech: {
                files: [ "root/html/bibliotech.html", "root/html/m.bibliotech.html", "root/html/preview.html" ],
                tasks: [ "htmlmin:bibliotech" ],
                options: { spawn: false }
            },
            cssbibliotech: {
                files: [ "root/css/dev/bibliotech.dev.css", "root/css/dev/m.bibliotech.dev.css" ],
                tasks: [ "cssmin:bibliotech" ],
                options: { spawn: false }
            }
        }
	});

    grunt.registerTask("login", [ "jshint:login", "uglify:login", "uglify:loginlib", "htmlmin:login", "cssmin:login" ]);
    grunt.registerTask("bibliotech", [ "jshint:bibliotech", "uglify:bibliotech", "uglify:bibliotechlib", "htmlmin:bibliotech", "cssmin:bibliotech" ]);

    grunt.registerTask("mongo", [ "shell:mongo" ]);
    grunt.registerTask("server", [ "clean", "express:dev", /*"open:dev",*/ "watch" ]);
    grunt.registerTask("prod", [ "clean", "express:production", "watch" ]);
};
