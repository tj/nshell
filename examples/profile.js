
// source with:
//   > . examples/profile

console.log('loaded!');

var colors = [31, 32, 33, 34, 35, 36];

// export a string or function

exports.PS1 = function(){
  var color = colors[Math.random() * colors.length | 0];
  return '\033[' + color + 'm▸\033[m ';
};
