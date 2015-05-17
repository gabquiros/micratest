module.exports = function(grunt) {

    var globalConfig = {
        envPath: 'http://localhost:8888/',
        buildFiles: {
            'build/en/index.html': ['src/en/index.html'],
            'build/en/news-article.html': ['src/en/news-article.html'],
            'build/en/calendar.html': ['src/en/calendar.html'],
            'build/en/thecar.html': ['src/en/thecar.html'],
            'build/en/drivers.html': ['src/en/drivers.html'],
            'build/en/about.html': ['src/en/about.html'],
            'build/fr/index.html': ['src/fr/index.html'],
            'build/fr/news-article.html': ['src/fr/news-article.html'],
            'build/fr/calendar.html': ['src/fr/calendar.html'],
            'build/fr/thecar.html': ['src/fr/thecar.html'],
            'build/fr/drivers.html': ['src/fr/drivers.html'],
            'build/fr/about.html': ['src/fr/about.html'],
        }
    };

    // configure the tasks
    grunt.initConfig({
        globalConfig: globalConfig,
        pkg: grunt.file.readJSON("package.json"),
        dot: true,
        copy: {
            build: {
                cwd: "src",
                src: ["**", "!en/sections/**", "!fr/sections/**","/js/socialhub.js"],
                dest: "build",
                expand: true
            },
            release: {
                cwd: "build",
                src: ["**", "!data/**"],
                dest: "release",
                expand: true
            }
        },
        clean: {
            build: {
                src: ["build"]
            },
            release: {
                src: ["release"]
            },
            scripts: {
                src: ["build/js/*.js", "!build/js/main.min.js", "!build/js/socialhub.js"]
                    //You can add multiple ignore files
                    //"build/*.js", "!build/NodeMaker-min.js", "!build/Files.js"
            },
            sass: {
                src: ["build/css/*.scss", "build/css/pages/*.scss"]
            },
            bower: {
                src: ["bower_components", "bower.json", "README.md"]
            }
        },
        uglify: {
            build: {
                options: {
                    mangle: true
                },
                files: {
                    "build/js/main.min.js": ["build/js/main.js"]
                }
            }
        },
        watch: {
            build: {
                files: ["src/**"],
                tasks: ["build"],
                options: {
                    livereload: true
                }
            },
            specs: {
                files: ["spec/**"],
                tasks: ["jasmine"],
                options: {
                    livereload: true
                }
            }
        },
        jasmine: {
            pivotal: {
                src: "path-to-file",
                options: {
                    specs: "path-to-specs",
                    outfile: "SpecRunner.html",
                    keepRunner: true
                }
            }
        },
        notify: {
            reload: {
                options: {
                    title: 'Live Reload',
                    message: 'Changes made'
                }
            }
        },
        sass: {
            options: {
                style: 'expanded'
            },
            dist: {
                files: {
                    'build/css/pages/home.css': 'src/css/pages/home.scss',
                    'build/css/pages/news-article.css': 'src/css/pages/news-article.scss',
                    'build/css/pages/calendar.css': 'src/css/pages/calendar.scss',
                    'build/css/pages/thecar.css': 'src/css/pages/thecar.scss',
                    'build/css/pages/drivers.css': 'src/css/pages/drivers.scss',
                    'build/css/pages/about.css': 'src/css/pages/about.scss'
                }
            }
        },
        open: {
            dev: {
                path: '<%= globalConfig.envPath  %>' + [grunt.option('lang') || 'en'],
                app: 'Google Chrome'
            }
        },
        processhtml: {
            dev: {
                options: {
                    process: true,
                    data: {
                        title: 'The Nissan Micra&reg; Cup - Canada\'a Most Affordable Racing Series'
                    }
                },
                files: globalConfig.buildFiles
            },
            dist: {
                files: {
                    'release/en/index.html': ['build/en/index.html'],
                    'release/en/news-article.html': ['build/en/news-article.html'],
                    'release/en/calendar.html': ['build/en/calendar.html'],
                    'release/en/thecar.html': ['build/en/thecar.html'],
                    'release/en/drivers.html': ['build/en/drivers.html'],
                    'release/en/about.html': ['build/en/about.html'],
                    'release/fr/index.html': ['build/fr/index.html'],
                    'release/fr/news-article.html': ['build/fr/news-article.html'],
                    'release/fr/calendar.html': ['build/fr/calendar.html'],
                    'release/fr/thecar.html': ['build/fr/thecar.html'],
                    'release/fr/drivers.html': ['build/fr/drivers.html'],
                    'release/fr/about.html': ['build/fr/about.html'],
                }
            }
        }
    });

    //EVENTS
    grunt.event.on('watch', function(action, filepath, target) {
        grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
    });

    //LOAD TASKS
    //Copies files from source folder to build folder - command: grunt copy
    grunt.loadNpmTasks("grunt-contrib-copy");
    //Wipes the build folder clean of files - command: grunt clean
    grunt.loadNpmTasks("grunt-contrib-clean");
    //Minifies files - command: grunt uglify
    grunt.loadNpmTasks("grunt-contrib-uglify");
    //Watch files for changes - command: grunt watch
    grunt.loadNpmTasks("grunt-contrib-watch");
    //Development server - command: grunt connect
    grunt.loadNpmTasks("grunt-contrib-connect");
    //Unit testing framework
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    //Sass compiler
    grunt.loadNpmTasks('grunt-contrib-sass');
    //Desktop notifier
    grunt.loadNpmTasks('grunt-notify');
    //Open
    grunt.loadNpmTasks('grunt-open');
    //Process HTML
    grunt.loadNpmTasks('grunt-processhtml');

    //REGISTER TASKS

    //Jasmine
    grunt.registerTask("test", ["jasmine"]);

    //Scripts
    grunt.registerTask(
        "scripts",
        "Uglifies and copies the Javascript files.", 
        ["uglify", "clean:scripts"]
    );

    //Sass
    grunt.registerTask(
        "compass",
        "Compiles sass file to css.", 
        ["sass", "clean:sass"]
    );


    //Build
    grunt.registerTask(
        "build-and-test",
        "Compiles all of the assets and copies the files to the build directory.", 
        ["clean:build", "copy:build", "scripts", "compass", "jasmine"]
    );

    //Build and Test
    grunt.registerTask(
        "build",
        "Compiles all of the assets and copies the files to the build directory.", 
        ["clean:build", "copy:build", "processhtml:dev", "scripts", "compass"]
    );

    //Build and release
    grunt.registerTask(
        "build-release",
        "Build the project and then creates a release version.", 
        ["build", "release"]
    );

    //Release
    grunt.registerTask(
        "release",
        "Copies all files from build directory and removes any development related code, to make the files ready for release.", 
        ["clean:release", "copy:release", "processhtml:dist"]
    );

    //Default - command: grunt default
    grunt.registerTask(
        "default",
        "Watches the project for changes, automatically builds them and runs a server.", 
        ["build", "open", "watch"]
    );
};