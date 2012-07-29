
/**
 * Module dependencies.
 */

var Process = require('./process');

/**
 * . <filename>
 */

exports['.'] = function(cmd, shell){
  var proc = new Process;

  // args required
  if (!cmd.argv.length) {
    process.nextTick(function(){
      proc.error('<filename> required\n');
      proc.exit(1);
    });

    return proc;
  }

  // source
  shell.source(cmd.argv[0]);
  process.nextTick(function(){
    proc.exit(0);
  });

  return proc;
};

/**
 * cd <path>
 */

exports.cd = function(cmd, shell){
  var proc = new Process;

  // args required
  if (!cmd.argv.length) {
    process.nextTick(function(){
      proc.error('<path> required\n');
      proc.exit(1);
    });

    return proc;
  }

  // chdir
  shell.cd(cmd.argv[0]);

  return proc;
};

/**
 * history
 */

exports.history = function(cmd, shell){
  var proc = new Process;

  process.nextTick(function(){
    shell.rl.history.forEach(function(cmd, i){
      proc.write('  ' + i + '  ' + cmd + '\n');
    });
    proc.exit(0);
  });

  return proc;
};

/**
 * which <name>
 */

exports.which = function(cmd, shell){
  var proc = new Process;

  // args required
  if (!cmd.argv.length) {
    process.nextTick(function(){
      proc.error('<name> required\n');
      proc.exit(1);
    });

    return proc;
  }

  // lookup
  process.nextTick(function(){
    var path = shell.which(cmd.argv[0]);
    if (!path) return proc.exit(1);
    proc.write(path + '\n');
    proc.exit(0);
  });

  return proc;
};

/**
 * exit <status>
 */

exports.exit = function(cmd, shell){
  process.exit(parseInt(cmd.argv[0], 10) || 0);
};