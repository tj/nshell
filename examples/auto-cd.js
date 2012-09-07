
/**
 * Module dependencies.
 */

var fs = require('fs')
  , exists = fs.existsSync
  , stat = fs.statSync;

// auto-cd

shell.on('command', function(e){
  var path = e.line.trim();
  if (exists(path) && stat(path).isDirectory) {
    e.preventDefault();
    shell.exec('cd "' + path + '"');
  }
});