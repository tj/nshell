
/**
 * Module dependencies.
 */

var Stream = require('stream');

/**
 * Expose `Process`.
 */

module.exports = Process;

/**
 * Initialize a new faux `Process`.
 *
 * @api public
 */

function Process() {
  this.stderr = new Stream;
  this.stdout = new Stream;
}

/**
 * Inherits from `Stream.prototype`.
 */

Process.prototype.__proto__ = Stream.prototype;

/**
 * Write `str` to stdout.
 *
 * @param {String} str
 * @api public
 */

Process.prototype.write = function(str){
  this.stdout.emit('data', new Buffer(str));
};

/**
 * Write `str` to stderr.
 *
 * @param {String} str
 * @api public
 */

Process.prototype.error = function(str){
  this.stderr.emit('data', new Buffer(str));
};

/**
 * Exit with status `code`.
 *
 * @param {Number} code
 * @api public
 */

Process.prototype.exit = function(code){
  this.emit('exit', code);
};