/*
 * DSS
 * https://github.com/darcyclarke/DSS
 *
 * Copyright (c) 2013 darcyclarke
 * Licensed under the MIT license.
 */

// Include dependancies
var mustache = require('mustache');
var wrench = require('wrench');
var dss = require('dss');

// Expose
module.exports = function(grunt){

  // Register DSS
  grunt.registerMultiTask('dss', 'Parse DSS comment blocks', function(){

    // Setup async promise
    var promise = this.async();

    // Merge task-specific and/or target-specific options with defaults
    var options = this.options({
      template: __dirname + '/../template/'
    });

    // Output options if --verbose cl option is passed
    grunt.verbose.writeflags(options, 'Options');

    // Describe custom parsers
    for(key in options.parsers){
      dss.parser(key, options.parsers[key]);
    }

    // Build Documentation
    this.files.forEach(function(f){
        
      // Filter files based on their existence
      var src = f.src.filter(function(filepath) {
        
        // Warn on and remove invalid source files (if nonull was set).
        if(!grunt.file.exists(filepath)){
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      });

      // Setup
      var files = src,
          template_dir = options.template,
          output_dir = f.dest,
          length = files.length,
          styleguide = [];

      // Parse files
      files.map(function(filename){

        // Report file
        grunt.log.writeln('• ' + grunt.log.wordlist([filename], {color: 'cyan'}));

        // Parse
        dss.parse(grunt.file.read(filename), { file: filename }, function(parsed){

          // Add filename
          parsed['file'] = filename;

          // Add comment block to styleguide
          styleguide.push(parsed);

          // Check if we're done
          if(length > 1){

            length = length - 1;

          } else {

            // Set output template and file
            var template = template_dir + 'index.mustache',
                output = output_dir + 'index.html';

            // Clone template directory structure
            wrench.copyDirSyncRecursive(template_dir, output_dir);

            // Read template
            var html = grunt.file.read(template);

            // Create HTML ouput
            html = mustache.render((html + ''), {project: grunt.file.readJSON('package.json'), files:styleguide});

            // Render file
            grunt.file.write(output, html);

            // Report build
            grunt.log.writeln('✓ Styleguide object generated!');
            grunt.log.writeln('✓ Documentation created at: ' + grunt.log.wordlist([output_dir], {color: 'cyan'}));

            // Return promise
            promise();

          }

        });

      });

    });

  });

};
