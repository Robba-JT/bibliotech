module.exports = function (grunt) {
    "use strict";
    require("load-grunt-tasks")(grunt);

	grunt.initConfig({
		"pkg": grunt.file.readJSON("package.json"),
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
                "tasks": ["nodemon:prod"/*, "watch"*/],
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
                    "ignore": [
						"node_modules/**",
						"root/css/**",
						"root/html/**",
						"root/images/**",
						"root/js/**",
						"root/lib/**",
						"root/trads/**",
						"logs/**",
						"views/**",
						"requests.js"
					],
					"env": {
                        "NODE_ENV": "development",
						"ROOT_URL": "https://localhost"
					}
                },
				"callback": function (nodemon) {
					nodemon.on("log", function (event) { console.log(event.colour); });
				}
            },
            "prod": {
                "script": "bibliotech.js",
                "options": {
                    "env": {
                        "NODE_ENV": "production",
						"ROOT_URL": "https://biblio.tech"
                    },
                    "cwd": __dirname,
                    "ignore": ["node_modules/**", "root/**", "logs/**", "views/**", "requests.js"]
                }
            }
        },
        "jshint": {
            "login": [
                "root/dev/js/bibliotech.proto.js",
                "root/dev/js/login.js"
            ],
            "bibliotech": [
                "root/dev/js/bibliotech.proto.js",
                "root/dev/js/bibliotech.js",
                "root/dev/js/modules/*.js"
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
            /*"loginlib": {
                "files": { "root/js/login.lib.js": [
                    "root/lib/Promise.min.js",
                    "node_modules/angular/angular.min.js",
                    "node_modules/lodash/index.js",
                    "root/dev/js/bibliotech.proto.js"
                ]}
            },*/
            "login": {
                "files": {
                    "root/js/login.js": [
                        "root/dev/js/login.js"
                    ],
					"root/js/login.lib.js": [
						"root/lib/Promise.min.js",
						"node_modules/angular/angular.min.js",
						"node_modules/lodash/index.js",
						"root/dev/js/bibliotech.proto.js"
					]
                }
            },
            /*"bibliotechlib": {
                "files": {
                    "root/js/bibliotech.lib.js": [
                        "root/lib/Promise.min.js",
                        "node_modules/angular/angular.min.js",
                        "node_modules/lodash/index.js",
                        "node_modules/socket.io-client/socket.io.js",
                        "root/lib/color-thief.js",
                        "root/dev/js/bibliotech.proto.js"
                    ]
                }
            },*/
            "bibliotech": {
                "files": {
					"root/js/bibliotech.lib.js": [
                        "root/lib/Promise.min.js",
                        "node_modules/angular/angular.min.js",
                        "node_modules/lodash/index.js",
                        "node_modules/socket.io-client/socket.io.js",
                        "root/lib/color-thief.js",
                        "root/dev/js/bibliotech.proto.js"
                    ],
                    "root/js/bibliotech.js": [
                        "root/dev/js/bibliotech.js",
                        "root/dev/js/modules/preloader.js",
                        "root/dev/js/modules/socket.js",
                        "root/dev/js/modules/idb.js",
                        "root/dev/js/modules/navbar.js",
                        "root/dev/js/modules/profile.js",
                        "root/dev/js/modules/search.js",
                        "root/dev/js/modules/bookcells.js",
                        "root/dev/js/modules/detail.js",
                        "root/dev/js/modules/defcloak.js"
                    ],
                    "root/js/m.bibliotech.js": [
                        "root/dev/js/m.bibliotech.js",
                        "root/dev/js/modules/preloader.js",
                        "root/dev/js/modules/socket.js",
                        "root/dev/js/modules/menu.js",
                        "root/dev/js/modules/m.profile.js",
                        "root/dev/js/modules/m.search.js",
                        "root/dev/js/modules/m.bookcells.js",
                        "root/dev/js/modules/m.detail.js",
                        "root/dev/js/modules/defcloak.js"
                    ],
                    "root/js/admin.js": [
                        "root/dev/js/admin.js",
                        "root/dev/js/modules/preloader.js",
                        "root/dev/js/modules/socket.js",
                        "root/dev/js/modules/defcloak.js"
                    ]
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
                    "views/desktop/login.html": "root/dev/html/login.html",
                    "views/desktop/error.html": "root/dev/html/error.html",
                    "views/desktop/maintenance.html": "root/dev/html/maintenance.html",
                    "views/mobile/login.html": "root/dev/html/m.login.html",
                    "views/mobile/error.html": "root/dev/html/m.error.html",
                    "views/mobile/maintenance.html": "root/dev/html/m.maintenance.html"
                }
            },
            "bibliotech": {
                "options": {
                    "removeComments": true,
                    "collapseWhitespace": true
                },
                "files": {
                    "views/desktop/bibliotech.html": "root/dev/html/bibliotech.html",
                    "views/mobile/bibliotech.html": "root/dev/html/m.bibliotech.html",
                    "views/desktop/admin.html": "root/dev/html/admin.html",
                    "views/mobile/admin.html": "root/dev/html/admin.html",
                    "views/preview.html": "root/dev/html/preview.html",
                    "root/html/bookcells.html": "root/dev/html/bookcells.html",
                    "root/html/detail.html": "root/dev/html/detail.html",
                    "root/html/navbar.html": "root/dev/html/navbar.html",
                    "root/html/menu.html": "root/dev/html/menu.html",
                    "root/html/profile.html": "root/dev/html/profile.html",
                    "root/html/search.html": "root/dev/html/search.html"
                }
            }
        },
        "cssmin": {
            "login": {
                "files": {
                    "root/css/login.css": [ "root/dev/css/login.css" ],
                    "root/css/m.login.css": [ "root/dev/css/m.login.css" ],
                    "root/css/error.css": [ "root/dev/css/error.css" ],
                    "root/css/m.error.css": [ "root/dev/css/m.error.css" ]
                }
            },
            "bibliotech": {
                "files": {
                    "root/css/bibliotech.css": [ "root/dev/css/bibliotech.css" ],
                    "root/css/m.bibliotech.css": [ "root/dev/css/m.bibliotech.css" ],
                    "root/css/admin.css": [ "root/dev/css/admin.css" ]
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
        "clean": [ "/logs/*.log" ],
        "watch": {
            "options": {
                "livereload": true
            },
            "jsserver": {
                "files": [ "bibliotech.js", "io/*.js", "db/*.js", "tools/*.js" ],
                "tasks": [ "jshint:server" ],
                "options": { "spawn": false }
            },
            "jslogin": {
                "files": [ "root/dev/js/bibliotech.proto.js", "root/dev/js/login.js", "root/dev/js/m.login.js" ],
                "tasks": [ "jshint:login", "uglify:login" ],
                "options": { "spawn": false }
            },
            "htmllogin": {
                "files": [
					"root/dev/html/login.html",
					"root/dev/html/error.html",
					"root/dev/html/maintenance.html",
					"root/dev/html/m.login.html",
					"root/dev/html/m.error.html",
					"root/dev/html/m.maintenance.html"
				],
                "tasks": [ "htmlmin:login" ],
                "options": { "spawn": false }
            },
            "csslogin": {
                "files": [ "root/dev/css/login.css", "root/dev/css/error.css", "root/dev/css/m.login.css", "root/dev/css/m.error.css" ],
                "tasks": [ "cssmin:login" ],
                "options": { "spawn": false }
            },
            "jsbibliotech": {
                "files": [
					"root/dev/js/bibliotech.proto.js",
					"root/dev/js/bibliotech.js",
					"root/dev/js/m.bibliotech.js",
					"root/dev/js/admin.js",
					"root/dev/js/modules/*.js"
				],
                "tasks": [ "jshint:bibliotech", "uglify:bibliotech" ],
                "options": { "spawn": false }
            },
            "htmlbibliotech": {
                "files": [ "root/dev/html/*.html" ],
                "tasks": [ "htmlmin:bibliotech" ],
                "options": { "spawn": false }
            },
            "cssbibliotech": {
                "files": [ "root/dev/css/bibliotech.css", "root/dev/css/m.bibliotech.css", "root/dev/css/admin.css" ],
                "tasks": [ "cssmin:bibliotech" ],
                "options": { "spawn": false }
            }
        }
	});

    grunt.registerTask("login", [ "jshint:login", "uglify:login", /*"uglify:loginlib", */"htmlmin:login", "cssmin:login" ]);
    grunt.registerTask("bibliotech", [
        "jshint:bibliotech",
        "uglify:bibliotech",
        /*"uglify:bibliotechlib",*/
        "htmlmin:bibliotech",
        "cssmin:bibliotech"
    ]);

    grunt.registerTask("mongo", [ "shell:mongo" ]);
    grunt.registerTask("ubuntu", [ "shell:ubuntu" ]);

    grunt.registerTask("server", [ "clean", "concurrent:dev" ]);
    grunt.registerTask("prod", [ /*"clean", */"concurrent:prod" ]);
};
