
// $npm install mime

var path = require('path');
var mime = require('mime');

// auto-editor (silly implementation)

shell.on('command', function(e){
  var line = e.line.trim();
  var type = mime.lookup(line);
  switch (type) {
    case 'text/plain':
    case 'text/css':
    case 'application/javascript':
      e.preventDefault();
      shell.exec('mate "' + line + '"');
      break;
  }
});