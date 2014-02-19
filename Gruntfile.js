var libs = [
  'modules/libs/ply.core.js'
];

var myscripts = [
  'modules/utils.js',
  'modules/googlespreadsheet.js',
  'modules/password-generator.js',
  'modules/popup.js',
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
        files: [{ expand: true, cwd: 'modules/', src: ['drivepass.*'], dest: 'chrome/js'}]
      }
    },
    
    watch: {
      js: {
        files: [libs, myscripts], tasks: ['jshint','concat','uglify','copy']
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
        src: [myscripts]
      }
    },

    concat: {
      build: {
        files: { 'modules/drivepass.js': [libs, myscripts] }
      }
    },

    uglify: {
      build: {
        files: {
          'modules/drivepass.min.js': ['modules/drivepass.js']
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