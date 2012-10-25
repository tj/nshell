
/**
 * Module dependencies.
 */

var minimatch = require('minimatch')
  , braceExpand = minimatch.braceExpand
  , fs = require('fs');

/**
 * Scan `str` producing an array
 * of tokens, respecting quoted values.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function scan(str) {
  var re = /(?:(\S*"[^"]+")|(\S*'[^']+')|(\S+))/g;
  var toks = [];
  var tok;
  var m;
  while (m = re.exec(str)) {
    tok = m[0];
    tok = braceExpand(tok, { nonegate: true });
    toks = toks.concat(tok);
  }
  return toks;
}

/**
 * Parse the given command-line `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

exports.parse = function(str){
  var toks = scan(str);
  var cmds = [];
  var cmd = { env: {}, argv: [] };
  var m, tok, part;

  for (var i = 0, len = toks.length; i < len; ++i) {
    tok = toks[i];

    if ('|' == tok) continue;

    // env
    if (tok.indexOf('=') > 0) {
      part = tok.split('=');
      cmd.env[part.shift()] = exports.unquote(part.join('='));
      continue;
    }

    // cmd
    cmd.name = tok;

    // args
    while (null != toks[i + 1] && '|' != toks[i + 1]) {
      cmd.argv.push(toks[++i]);
    }

    // push
    cmds.push(cmd);
    cmd = { env: {}, argv: [] };
  }

  return cmds;
};

/**
 * Check if `path` exists and is a directory.
 *
 * @param {String} path
 * @return {Boolean}
 * @api false
 */

exports.isDirectory = function(path){
  try {
    var s = fs.statSync(path);
    return s.isDirectory();
  } catch (err) {
    return false;
  }
};

/**
 * Unquote `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.unquote = function(str){
  return str
    .replace(/^"|"$/g, '')
    .replace(/^'|'$/g, '')
    .replace(/\\n/g, '\n');
};

/**
 * Check if `str` is quoted.
 *
 * @param {String} str
 * @return {Boolean}
 * @api private
 */

exports.isQuoted = function(str){
  return '"' == str[0] || "'" == str[0];
};

/**
 * Strip ansi escape codes from `str`.
 *
 * TODO: finish
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.stripEscapeCodes = function(str){
  return str
    .replace(/\033\[[^m]*m/g, '');
};