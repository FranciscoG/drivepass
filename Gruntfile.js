var myscripts = [
  'modules/dp.*.js',
  'modules/main.js'
];

module.exports = function(grunt){
  "use strict";

  require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

  grunt.initConfig({

    config: {
      timestamp: parseInt(new Date().getTime() / 1000, 10)
    },

    pkg: grunt.file.readJSON('package.json'),
    
    copy: {
      chrome: {
        files: [
          // just copying the concatenated and minified files
          { expand: true, cwd: 'modules/build', src: ['drivepass.*'], dest: 'Chrome/js'},
          // copying the css that would be used by all 
          { expand: true, cwd: 'modules/css', src: ['**'], dest: 'Chrome/css'},
          // copying images that might be used by all browser extensions
          { expand: true, cwd: 'modules/img', src: ['**'], dest: 'Chrome/img'}
        ]
      }
    },
    
    watch: {
      js: {
        files: [myscripts], tasks: ['jshint','concat','uglify','copy']
      }
    },

    jshint: {
      options: {
        boss: true,
        browser: true,
        curly: true,
        eqeqeq: true,
        eqnull: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        node: true,
        sub: true,
        undef: true,
        globals: {
          DrivePass : true,
          chrome : true,
          utils : true,
          Ply : true
        }
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: [myscripts] // only going to hint myscripts and not 3rd party libs
      }
    },

    concat: {
      build: {
        files: { 'modules/build/drivepass.js': ['modules/libs/*.js', myscripts] }
      }
    },

    uglify: {
      build: {
        files: {
          'modules/build/drivepass.min.js': ['modules/build/drivepass.js']
        },
        options: {
          beautify: false,
          compress: true,
          mangle: true,
          report: false,
          preseveComments: false
        }
      }
    }
  });

grunt.registerTask('default', ['jshint','concat','uglify','copy']);
grunt.registerTask('chrome',  ['jshint','concat','uglify','copy:chrome','watch']);

};