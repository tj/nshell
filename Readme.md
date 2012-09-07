# nshell

  A work-in-progress scriptable shell written with node (replacing bash, ksh, etc).

## Installation

    $ npm install -g nshell

 For now clone and:
 
    $ npm install
    $ ./bin/shell

## About

  Just started this as a quick proof of concept,
  but it's kinda fun! Keep in mind this is not an
  attempt to become a POSIX shell.

## Features

  Small set of features so far:
  
  - PS1
  - pipelining
  - scriptability!
  - aliases
  - sources `~/.profile.js`
  - saves history to `~/.nshell-history`
  - brace expansion
  - filename auto-completion
  - some built-ins
  - some magic variables

### Built-ins

  Currently the following built-ins are available:
  
  - `.` -- source a javascript file
  - `cd` -- change directory
  - `which` -- search __PATH__ for an executable
  - `exit` -- exit nshell
  - `history` -- view history

### Variables

  Currently the following magic vars are available:
  
  - `$?` the exit status of the previous command
  - `!!` the string value of the previous command

### Events

 Hook into events with `shell.on(event, callback)`:

  - `cd` (dir) changing directories
  - `exec` (line) is about to be executed
  - `alias` (name, cmd) when an alias is defined
  - `source` (file, mod) when a module is sourced
  - `command` (e) when a command line is inputted, but not yet executed

### ~/.profile.js

  By default `nshell(1)` currently sources `~/.profile.js`,
  this is where you can put config much like other shells.

### PS1

  Change your __PS1__ prompt by exporting a string:

```js
exports.PS1 = "tj> ";
```

  Or create something more dynamic and fancy
  by exporting a function:

```js
var colors = [31, 32, 33, 34, 35, 36];

exports.PS1 = function(){
  var color = colors[Math.random() * colors.length | 0];
  return '\033[' + color + 'm>\033[m ';
};
```

### Brace expansion

  Brace expansion works as you'd expect:

```
> touch foobar
> touch foobaz
> rm foo{bar,baz}
```

### Sourcing

  You may source files much like you do with `require()` in node,
  support you have "test.js", you may load it with either of
  the following:

```
▸ . test.js
▸ . test
```

### Aliases

```js
shell.alias('GET', 'burl GET');
shell.alias('HEAD', 'burl -I');
shell.alias('POST', 'burl POST');
shell.alias('PUT', 'burl PUT');
shell.alias('PATCH', 'burl PATCH');
shell.alias('DELETE', 'burl DELETE');
shell.alias('DEL', 'burl DELETE');
shell.alias('OPTIONS', 'burl OPTIONS');
```

## Debugging

```js
$ DEBUG=nshell ./bin/shell
▸ cat Readme.md
  nshell cmd [{"name":"cat","argv":["Readme.md"]}] +1.1m
  nshell env {} +0ms
  nshell which cat +0ms
  nshell found /bin/cat +2ms
  nshell spawn /bin/cat ["Readme.md"] +0ms
  nshell exit 0 +5ms
  nshell prompt +0ms
```

## Examples

  Some cool examples showing off the power
  of scripting your shell!

### Auto-cd

  By default `nshell(1)` does not auto-chdir when
  the given line is a directory, however you can
  easily script this in:

```js
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
```

Usage:

```js
▸ pwd
/Users/tj/projects/nshell
▸ node_modules/commander
▸ pwd
/Users/tj/projects/nshell/node_modules/commander
▸ ../..
▸ pwd
/Users/tj/projects/nshell
```

### Auto-edit

  By default `nshell(1)` will simply give you
  a "command not found" error if you try to
  type a filename, however you can script
  in the ability to edit that file depending
  on its mime type:

```js
// $ npm install mime

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
```

### Command replay

  To replay the previous command on a blank line
  you can also listen on the "command" event and
  use the `shell.lastCommand` property, which is
  populated by the last successfully executed 
  command line.

```js
shell.on('command', function(e){
  if ('' == e.line.trim()) {
    e.preventDefault();
    shell.exec(shell.lastCommand);
  }
});
```

### JavaScript expansion

  Modifications to `e.line` are accepted by nshell,
  this means you can progressively layer on plugins,
  in this case a naive implementation of "js expansion":

```js
shell.on('command', function(e){
  e.line = expansion(e.line);
});

function expansion(line) {
  return line.replace(/`(.*?)`/, function(_, js){
    return eval('(' + js + ')');
  });
}
```

Usage:

```
▸ echo `Math.pow(2, 32)`
▸ 4294967296
▸ cat `"Make" + "file"`

test:
	@./node_modules/.bin/mocha \
		--require should \
		--reporter spec
...
```

## License 

(The MIT License)

Copyright (c) 2012 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.