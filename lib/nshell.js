
/**
 * Module dependencies.
 */

var readline = require('readline')
  , child = require('child_process')
  , debug = require('debug')('nshell')
  , Stream = require('stream')
  , builtins = require('./builtins')
  , fs = require('fs')
  , readdir = fs.readdirSync
  , exists = fs.existsSync
  , stat = fs.statSync
  , read = fs.readFileSync
  , path = require('path')
  , resolve = path.resolve
  , dirname = path.dirname
  , basename = path.basename
  , join = path.join
  , exec = child.exec
  , spawn = child.spawn
  , utils = require('./utils');

/**
 * Expose `Shell`.
 */

module.exports = Shell;

/**
 * Initialize a new `Shell` with the given `stream`.
 *
 * Events:
 *
 *  - `blank` on a blank line
 *  - `cd` (dir) changing directories
 *  - `exec` (line) is about to be executed
 *  - `alias` (name, cmd) when an alias is defined
 *  - `source` (file, mod) when a module is sourced
 *
 * @param {Stream} stream
 * @api public
 */

function Shell(stream) {
  if (!stream) throw new Error('stream required');
  this.aliases = {};
  this.stdin = stream.stdin;
  this.stdout = stream.stdout;
  this.stderr = stream.stderr;
  this.historyPath = join(process.env.HOME, '.nshell-history');
  this.history = fs.createWriteStream(this.historyPath, { flags: 'a' });
  this.ps1(function(){ return '> ' });
  this.rl = readline.createInterface({
    input: this.stdin,
    output: this.stdout,
    completer: this.completer.bind(this)
  });
  this.rl.history = this.loadHistory();
  this.prompt();
  this.rl.on('line', this.writeHistory.bind(this));
  this.rl.on('line', this.exec.bind(this));
  this.lastCommand = '';
  this.lastExitStatus = 0;
  this.boot();
}

/**
 * Inherits from `Stream.prototype`.
 */

Shell.prototype.__proto__ = Stream.prototype;

/**
 * Alias `name` to `cmd`.
 *
 * @param {String} name
 * @param {String} cmd
 * @return {Shell}
 * @api public
 */

Shell.prototype.alias = function(name, cmd){
  this.emit('alias', name, cmd);
  cmd = utils.parse(cmd)[0];
  debug('alias %s %j', name, cmd);
  this.aliases[name] = cmd;
  return this;
};

/**
 * Boot the shell.
 *
 *  - load ~/.profile.js
 *
 * @api private
 */

Shell.prototype.boot = function(){
  this.source(join(process.env.HOME, '.profile.js'));
};

/**
 * Auto-completion callback.
 *
 * @param {String} line
 * @param {Function} fn
 * @api private
 */

Shell.prototype.completer = function(line, fn){
  var dir;
  var match = line.split(/\s+/).pop();

  try {
    var s = stat(match);
    if (s.isDirectory()) dir = match
    else dir = dirname(match);
  } catch (err) {
    dir = dirname(match);
  }

  debug('autocomplete %j in %j', match, dir);

  var matches = readdir(dir)
    .map(join.bind(null, dir))
    .filter(function(file){
      return 0 == file.indexOf(match);
    })//.map(basename); node doesnt allow this?

  // TODO: does node allow customizing this output...?
  if (matches.length) console.log();
  fn(null, [matches, match]);
};

/**
 * Load history.
 *
 * @return {Array}
 * @api public
 */

Shell.prototype.loadHistory = function(){
  // TODO: options ...
  // TODO: .history.write() via a History object
  var path = this.historyPath;
  if (!exists(path)) return [];
  return read(path, 'utf8').split('\n');
};

/**
 * Write `line` to the history.
 *
 * @param {String} line
 * @api public
 */

Shell.prototype.writeHistory = function(line){
  this.history.write(line + '\n');
};

/**
 * Assign PS1 `fn`.
 *
 * @param {Function} fn
 * @api public
 */

Shell.prototype.ps1 = function(fn){
  this._ps1 = fn;
};

/**
 * Source the given `file`.
 *
 * @param {String} file
 * @api public
 */

Shell.prototype.source = function(file){
  debug('source %s', file);
  if (!exists(file)) return;
  file = resolve(file);
  debug('load %s', file);
  var mod = require(file);
  this.emit('source', file, mod);
  // TODO: emit "source" and handle this elsewhere 
  if ('string' == typeof mod.PS1) this.ps1(function(){ return mod.PS1 });
  if ('function' == typeof mod.PS1) this.ps1(mod.PS1);
};

/**
 * Prompt for input.
 *
 * @api public
 */

Shell.prototype.prompt = function(){
  debug('prompt');

  if (this._ps1) {
    var ps1 = this._ps1();
    this.rl.setPrompt(ps1, utils.stripEscapeCodes(ps1).length);
  }

  this.rl.prompt();
};

/**
 * Get env variable by `name`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Shell.prototype.env = function(name){
  return process.env[name];
};

/**
 * Pre-process the given `cmds`.
 *
 *  - assign `$?` to the last exit status
 *  - unquote arguments
 *
 * @param {Array} cmds
 * @api private
 */

Shell.prototype.process = function(cmds){
  var self = this;
  cmds.forEach(function(cmd){
    var alias = self.aliases[cmd.name];

    if (alias) {
      debug('aliasing %s to %j', cmd.name, alias);
      cmd.name = alias.name;
      cmd.argv = alias.argv.concat(cmd.argv);
    }

    cmd.argv = cmd.argv.map(function(arg){
      switch (arg) {
        case '$?': return self.lastExitStatus;
        case '!!': return self.lastCommand;
        default: return utils.unquote(arg);
      }
    });
  });
};

/**
 * Lookup `cmds` before laying the pipeline.
 *
 * @param {Array} cmds
 * @return {Number} 1 when successful
 * @api private
 */

Shell.prototype.lookup = function(cmds){
  for (var i = 0, len = cmds.length; i < len; ++i) {
    var cmd = cmds[i];
    debug('which %s', cmd.name);
    cmd.path = this.which(cmd.name);
    cmd.builtin = builtins.hasOwnProperty(cmd.name);
    if (cmd.builtin) continue;
    if (!cmd.path) return this.missing(cmd);
    debug('found %s', cmd.path);
  }
  return 1;
};

/**
 * Change to `dir`.
 *
 * @param {String} dir
 * @api public
 */

Shell.prototype.cd = function(dir){
  this.emit('cd', dir);
  process.chdir(dir);
};

/**
 * Execute the given command `line`.
 *
 * @param {String} line
 * @api public
 */

Shell.prototype.exec = function(line){
  // TODO: clean up, this would be cleaner if we had gotos ;)
  line = line.trim();
  if ('' == line) return this.lastCommand = line, this.emit('blank'), this.prompt();
  if (utils.isDirectory(line)) return this.lastCommand = line, this.cd(line), this.prompt();
  var cmds = utils.parse(line);
  if (!cmds.length) return this.lastCommand = line, this.prompt();
  this.process(cmds);
  this.lastCommand = line;
  debug('cmd %j', cmds);
  debug('env %j', cmds.env);
  if (!this.lookup(cmds)) return this.prompt();
  this.emit('exec', line);
  this.pipeline(cmds);
};

/**
 * Execute pipeline.
 *
 * @param {Array} cmds
 * @api private
 */

Shell.prototype.pipeline = function(cmds){
  var self = this;

  var procs = cmds.map(this.execCommand.bind(this));

  if (~procs.indexOf(null)) return this.prompt();

  cmds.forEach(function(cmd, i){
    var proc = procs[i];
    var next = procs[i + 1];

    proc.stderr.pipe(self.stderr);

    if (next) {
      debug('pipe %s to %s', cmd.name, cmds[i + 1].name);
      proc.stdout.pipe(next.stdout);
    } else {
      proc.stdout.pipe(self.stdout);
    }
  });

  procs[procs.length - 1].on('exit', function(code){
    debug('exit %d', code);
    self.lastExitStatus = code;
    self.prompt();
  });
};

/**
 * Return the absolute path of `name`
 * by searching __PATH__, or return `undefined`.
 *
 * @param {String} name
 * @return {String}
 * @api public
 */

Shell.prototype.which = function(name){
  var paths = this.env('PATH').split(':');
  var path;
  for (var i = 0, len = paths.length; i < len; ++i) {
    path = join(paths[i], name);
    if (exists(path)) return path;
  }
};

/**
 * Output error `msg`.
 *
 * @param {String} msg
 * @api public
 */

Shell.prototype.error = function(msg){
  // TODO: format()
  this.stderr.write(msg + '\n');
};

/**
 * Output missing `cmd` message.
 *
 * @param {String} cmd
 * @api private
 */

Shell.prototype.missing = function(cmd){
  this.error(cmd.name + ' command not found');
  this.lastExitStatus = 127;
};

/**
 * Execute a single `cmd`.
 *
 * @param {Object} cmd
 * @return {ChildProcess}
 * @api private
 */

Shell.prototype.execCommand = function(cmd){
  if (cmd.builtin) return builtins[cmd.name](cmd, this);
  for (var key in process.env) cmd.env[key] = process.env[key];
  debug('spawn %s %j', cmd.path, cmd.argv);
  return spawn(cmd.path, cmd.argv, { env: cmd.env });
};

