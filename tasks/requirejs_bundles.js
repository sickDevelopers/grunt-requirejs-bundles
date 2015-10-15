/*
 * grunt-requirejs-bundles
 * null
 *
 * Copyright (c) 2015 Oscar Chinellato
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('requirejs_bundles', 'RequireJs grunt modules compiler', function() {

    var configContent,
      mainConfigObj,
      require,
      gruntBundlesOptions,
      paths,
      shim;


    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', '
    });

    if( options.requireJsConfig == undefined || options.modulesPath == undefined ) {
      grunt.fail.fatal('RequireJsConfig Option must be specified, modulesPath option must be specified');
      return false;
    }

    // read common.js content
    configContent = grunt.file.read( options.requireJsConfig );

    // build fake require and evaluate require config code
    require = {
      config: function( configObj ) {
        mainConfigObj = configObj;
      }
    };
    // eval call require.config method which imports 
    // require.config object in local mainConfigObj
    eval( configContent );

    gruntBundlesOptions = mainConfigObj.grunt_bundles;
    paths = mainConfigObj.paths;
    shim = mainConfigObj.shim;

    if( gruntBundlesOptions === undefined ) {
      grunt.fail.fatal('grunt_bundles option not found in ' + options.requireJsConfig );
    }

    // make modules dir if not exists
    if( !grunt.file.isDir(options.modulesPath) ) {
      grunt.file.mkdir( options.modulesPath );  
    }
    
    gruntBundlesOptions.modules.forEach( function(m) {

      var moduleFilePath = options.modulesPath + '/' + m.name + '.js';

      var dest = '';

      // concat deps
      m.deps.forEach( function(d) {

        grunt.log.writeln( paths[d] );
        var thePath = d;

        if( paths[d] !== undefined ) {
          thePath = paths[d];
        }

        var filePath = options.depsPath + '/' + thePath + '.js';
        
        if (!grunt.file.exists(filePath)) {
          grunt.fail.fatal( 'Source file "' + filePath + '" not found.');
        }

        // concat
        dest += grunt.util.normalizelf( grunt.file.read( filePath ) ) + ';';

      });


      // delete old files
      // if( grunt.file.exists( moduleFilePath ) ) {
      //   grunt.file.delete( moduleFilePath );
      // }

      // create new js module file
      grunt.file.write( moduleFilePath, dest );

    });

    // // Iterate over all specified file groups.
    // this.files.forEach(function(f) {
    //   // Concat specified files.
    //   var src = f.src.filter(function(filepath) {
    //     // Warn on and remove invalid source files (if nonull was set).
    //     if (!grunt.file.exists(filepath)) {
    //       grunt.log.warn('Source file "' + filepath + '" not found.');
    //       return false;
    //     } else {
    //       return true;
    //     }
    //   }).map(function(filepath) {
    //     // Read file source.
    //     return grunt.file.read(filepath);
    //   }).join(grunt.util.normalizelf(options.separator));

    //   // Handle options.
    //   src += options.punctuation;

    //   // Write the destination file.
    //   grunt.file.write(f.dest, src);

    //   // Print a success message.
    //   grunt.log.writeln('File "' + f.dest + '" created.');
    // });


  });

};
