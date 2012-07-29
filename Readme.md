
# nshell

  A work-in-progress scriptable shell written with node.

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
  - auto-cd
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
> . test.js
> . test
```

### Auto-cd

  By default `nshell(1)` auto-chdirs when
  the given line is a directory.

```
> pwd
/Users/tj/projects/nshell
> node_modules/commander
> pwd
/Users/tj/projects/nshell/node_modules/commander
> ../..
> pwd
/Users/tj/projects/nshell
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
> cat Readme.md
  nshell cmd [{"name":"cat","argv":["Readme.md"]}] +1.1m
  nshell env {} +0ms
  nshell which cat +0ms
  nshell found /bin/cat +2ms
  nshell spawn /bin/cat ["Readme.md"] +0ms
  nshell exit 0 +5ms
  nshell prompt +0ms
```

## Todo

  tons of shit

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