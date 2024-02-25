module.exports = function(grunt) {

  const localCfg = require('./config.js');

  var replaceGroup = [{
		pattern: localCfg.devUrl,
		replacement: localCfg.prodUrl
  }, {
		pattern: localCfg.devCssFile,
		replacement: localCfg.prodCssFile
	 }
  ];

  if (localCfg.useHttps === true) {
  		replaceGroup.push({
			pattern: /http:\/\//g,
			replacement: "https://"
		});
  }


  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        // banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: [
            'public/src/jquery-2.1.4.js',
            'public/src/es6-promise.js',
            'public/src/<%= pkg.name %>.js'
        ],
        dest: 'public/build/<%= pkg.name %>.min.js'
      }
    },
    cssmin: {
        options: {
          shorthandCompacting: true,
          roundingPrecision: -1
        },
        target: {
          files: {
            'public/build/<%= pkg.name %>.min.css': [
                'public/src/<%= pkg.name %>.css'
            ]
          }
        }
    },
    copy: {
      main: {
        files: [
          {
              expand: true,
              flatten: true,
              cwd: 'public/src/images/',
              src: '**',
              dest: 'public/build/images/'
          }
        ]
      }
    },
    "string-replace": {
        dist: {
        files: [{
          expand: true,
          cwd: 'public/build/',
          src: ['*.min.js', '*.min.css'],
          dest: 'public/build/'
        }],
        options: {
          replacements: replaceGroup
		  }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-string-replace');

  var tasks = ['uglify', 'cssmin', 'copy'];

    // if devMode, replace url path with something else in config.js
    if (localCfg.devMode != true) {
        tasks.push('string-replace');
    }

  // Default task(s).
  grunt.registerTask('default', tasks);

};
