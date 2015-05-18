var child_process = require('child_process');
var fixArgsOnWindows = require('../index.js');

var args = fixArgsOnWindows(process.argv);

args.slice(2).forEach(function(cmd, i) {
	console.log('Executing argument ' + i + ': ' + cmd);
	child_process.spawn('cmd', ['/c', cmd], {stdio: 'inherit'});
});
