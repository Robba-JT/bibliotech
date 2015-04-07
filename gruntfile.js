module.exports = function (grunt) {
    "use strict";
    require("load-grunt-tasks")(grunt);

	grunt.initConfig({
        jshint: {
            login: ["root/js/dev/login.dev.js"],
            bibliotech: ["root/js/dev/bibliotech.dev.js"]
        },
        uglify: {
            loginlib: {
                files: { "root/js/login.lib.js": [ "root/lib/jquery-2.1.3.min.js" ]}
            },
            login: {
                files: { "root/js/login.js": [ "root/js/dev/login.dev.js" ]}
            },
            bibliotechlib: {
                files: {
                    "root/js/bibliotech.lib.js": [
                        "root/lib/jquery-2.1.3.min.js",
                        "root/lib/socket.io-1.3.5.min.js",
                        "root/lib/lodash-3.6.0.min.js"
                    ]
                }
            },
            bibliotech: {
                files: {
                    "root/js/bibliotech.js": [ "root/js/dev/bibliotech.dev.js" ]
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
                    "views/preview.html": "root/html/preview.html"
                }
            }
        },
        cssmin: {
            login: {
                files: {
                    "root/css/login.css": [
                        "root/css/dev/login.dev.css"
                    ],
                    "root/css/error.css": [
                        "root/css/dev/error.dev.css"
                    ]
                }
            },
            bibliotech: {
                files: {
                    "root/css/bibliotech.css": [
                        "root/css/dev/bibliotech.dev.css"
                    ]
                }
            }
        },
        watch: {
            jslogin: {
                files: [ "root/js/dev/login.dev.js" ],
                tasks: [ "jshint:login", "uglify:login" ],
                options: { spawn: false }
            },
            htmllogin: {
                files: [ "root/html/login.html", "root/html/error.html" ],
                tasks: [ "htmlmin:login" ],
                options: { spawn: false }
            },
            csslogin: {
                files: [ "root/css/dev/login.dev.css", "root/css/dev/error.dev.css" ],
                tasks: [ "cssmin:login" ],
                options: { spawn: false }
            },
            jsbibliotech: {
                files: [ "root/js/dev/bibliotech.dev.js" ],
                tasks: [ "jshint:bibliotech", "uglify:bibliotech" ],
                options: { spawn: false }
            },
            htmlbibliotech: {
                files: [ "root/html/bibliotech.html", "root/html/preview.html" ],
                tasks: [ "htmlmin:bibliotech" ],
                options: { spawn: false }
            },
            cssbibliotech: {
                files: [ "root/css/dev/bibliotech.dev.css" ],
                tasks: [ "cssmin:bibliotech" ],
                options: { spawn: false }
            }
        }
	});

    grunt.registerTask("login", [ "jshint:login", "uglify:login", "uglify:loginlib", "htmlmin:login", "cssmin:login" ]);
    grunt.registerTask("bibliotech", [ "jshint:bibliotech", "uglify:bibliotech", "uglify:bibliotechlib", "htmlmin:bibliotech", "cssmin:bibliotech" ]);
};
