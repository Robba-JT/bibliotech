module.exports = function (grunt) {
    "use strict";
    require("load-grunt-tasks")(grunt);

	grunt.initConfig({
        "shell": {
            "options": {
                "stdout": true,
                "stderr": true,
                "failOnError": true
            },
            "mongo": {
                "command": "F:/MongoDB/Server/3.0/bin/mongod --port 29017 --dbpath ../MongoDB/Data/db"
            },
            "ubuntu": {
                "command": "mongod --port 29017 --dbpath ../bibliodata/db"
            }
        },
        "concurrent": {
            "dev": {
                "tasks": ["nodemon:dev", "watch"],
                "options": {
                    "logConcurrentOutput": true
                }
            },
            "prod": {
                "tasks": ["nodemon:prod", "watch"],
                "options": {
                    "logConcurrentOutput": true
                }
            }
        },
        "nodemon": {
            "dev": {
                "script": "bibliotech.js",
                "options": {
                    "nodeArgs": ["--debug"],
                    "cwd": __dirname,
                    "ignore": ["node_modules/**", "root/**", "logs/**", "views/**", "gruntfile.js", "requests.js"]
                }
            },
            "prod": {
                "script": "bibliotech.js",
                "options": {
                    "env": {
                        "NODE_ENV": "production"
                    },
                    "cwd": __dirname,
                    "ignore": ["node_modules/**", "root/**", "logs/**", "views/**", "gruntfile.js", "requests.js"]
                }
            }
        },
        /*"express": {
            "dev": {
              "options": {
                "script": "bibliotech.js"
              }
            },
            "prod": {
              "options": {
                "script": "bibliotech.js",
                "node_env": "production"
              }
            }
        },*/
        "jshint": {
            "login": [
                "root/js/dev/bibliotech.proto.js",
                "root/js/dev/login.js"
            ],
            "bibliotech": [
                "root/js/dev/bibliotech.proto.js",
                "root/js/dev/bibliotech.js",
                "root/js/dev/modules/*.js"
            ],
            "server": [
                "bibliotech.js",
                "db/*.js",
                "io/*.js",
                "tools/*.js",
                "!tools/trads.js"
            ]
        },
        "uglify": {
            "options": {
                "compress": {
                    "drop_console": true
                }
            },
            "loginlib": {
                "files": { "root/js/login.lib.js": [
                    "node_modules/lodash/index.js",
                    "root/lib/Promise.min.js",
                    "root/js/dev/bibliotech.proto.js"
                ]}
            },
            "login": {
                "files": {
                    "root/js/login.js": [
                        "root/js/dev/login.js"
                    ]
                }
            },
            "bibliotechlib": {
                "files": {
                    "root/js/bibliotech.lib.js": [
                        "node_modules/angular/angular.min.js",
                        "node_modules/lodash/index.js",
                        "node_modules/socket.io-client/socket.io.js",
                        "root/lib/color-thief.js",
                        "root/lib/Promise.min.js",
                        "root/js/dev/bibliotech.proto.js"
                    ]
                }
            },
            "bibliotech": {
                "files": {
                    "root/js/bibliotech.js": [
                        "root/js/dev/bibliotech.js",
                        "root/js/dev/modules/navbar.js",
                        "root/js/dev/modules/profile.js",
                        "root/js/dev/modules/search.js",
                        "root/js/dev/modules/bookcells.js",
                        "root/js/dev/modules/detail.js"
                    ],
                    "root/js/admin.js": [ "root/js/dev/admin.js" ]
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
                    "views/login.html": "root/html/login.html",
                    "views/error.html": "root/html/error.html",
                    "views/maintenance.html": "root/html/maintenance.html"
                }
            },
            "bibliotech": {
                "options": {
                    "removeComments": true,
                    "collapseWhitespace": true
                },
                "files": {
                    "views/bibliotech.html": "root/html/bibliotech.html",
                    "views/admin.html": "root/html/admin.html",
                    "views/preview.html": "root/html/preview.html",
                    "root/html/bookcells.html": "root/html/dev/bookcells.html",
                    "root/html/detail.html": "root/html/dev/detail.html",
                    "root/html/navbar.html": "root/html/dev/navbar.html",
                    "root/html/profile.html": "root/html/dev/profile.html",
                    "root/html/search.html": "root/html/dev/search.html"
                }
            }
        },
        "cssmin": {
            "login": {
                "files": {
                    "root/css/login.css": [ "root/css/dev/login.css" ],
                    "root/css/error.css": [ "root/css/dev/error.css" ]
                }
            },
            "bibliotech": {
                "files": {
                    "root/css/bibliotech.css": [
                        "root/css/dev/base.css",
                        "root/css/dev/bookcells.css",
                        "root/css/dev/detail.css",
                        "root/css/dev/navbar.css",
                        "root/css/dev/windows.css"
                    ],
                    "root/css/admin.css": [ "root/css/dev/admin.css" ]
                }
            }
        },
        "open": {
            "dev": {
                "path": "https://localhost"
            },
            "prod": {
                "path": "https://biblio.tech"
            }
        },
        "clean": [ "logs/*.log" ],
        "watch": {
            "options": {
                "livereload": true
            },
            /*"express": {
                "files":  [ "db/*.js", "io/*.js", "tools/*.js", "bibliotech.js", "routes/*.js" ],
                "tasks":  [ "nodemon:dev" ],
                "options": {
                    "spawn": false
                }
            },*/
            "jsserver": {
                "files": [ "bibliotech.js", "io/*.js", "db/*.js", "tools/*.js" ],
                "tasks": [ "jshint:server" ],
                "options": { "spawn": false }
            },
            "jslogin": {
                "files": [ "root/js/dev/bibliotech.proto.js", "root/js/dev/login.js", "root/js/dev/m.login.js" ],
                "tasks": [ "jshint:login", "uglify:login" ],
                "options": { "spawn": false }
            },
            "htmllogin": {
                "files": [ "root/html/login.html", "root/html/error.html" ],
                "tasks": [ "htmlmin:login" ],
                "options": { "spawn": false }
            },
            "csslogin": {
                "files": [ "root/css/dev/login.css", "root/css/dev/error.css" ],
                "tasks": [ "cssmin:login" ],
                "options": { "spawn": false }
            },
            "jsbibliotech": {
                "files": [ "root/js/dev/bibliotech.proto.js", "root/js/dev/bibliotech.js", "root/js/dev/modules/*.js" ],
                "tasks": [ "jshint:bibliotech", "uglify:bibliotech" ],
                "options": { "spawn": false }
            },
            "htmlbibliotech": {
                "files": [ "root/html/bibliotech.html", "root/html/preview.html", "root/html/dev/*.html" ],
                "tasks": [ "htmlmin:bibliotech" ],
                "options": { "spawn": false }
            },
            "cssbibliotech": {
                "files": [ "root/css/dev/base.css", "root/css/dev/bookcells.css", "root/css/dev/detail.css", "root/css/dev/navbar.css", "root/css/dev/windows.css" ],
                "tasks": [ "cssmin:bibliotech" ],
                "options": { "spawn": false }
            }
        }
	});

    grunt.registerTask("login", [ "jshint:login", "uglify:login", "uglify:loginlib", "htmlmin:login", "cssmin:login" ]);
    grunt.registerTask("bibliotech", [
        "jshint:bibliotech",
        "uglify:bibliotech",
        "uglify:bibliotechlib",
        "htmlmin:bibliotech",
        "cssmin:bibliotech"
    ]);

    grunt.registerTask("mongo", [ "shell:mongo" ]);
    grunt.registerTask("ubuntu", [ "shell:ubuntu" ]);

    grunt.registerTask("server", [ "clean", "concurrent:dev"/*, "open:dev", "watch"*/ ]);
    grunt.registerTask("prod", [ "clean", "concurrent:prod"/*, "express:prod", "watch"*/ ]);
};
