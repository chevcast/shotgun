var shotgun = require('../index'),
	prompt = require('prompt');

var shell = new shotgun.Shell('cmds');

function callback(err, val) {
	prompt.pause();
	var exit = false;
	if (val.cmdStr && !err) {
		var result = shell.execute(val.cmdStr);
		if (result.clearDisplay) console.warn('clear is not supported')
		exit = result.exit;
		result.lines.forEach(function (line) {
			console[line.type](line.text)
		});
	}
	if (!exit) {
		prompt.start();
		prompt.get(['cmdStr'], callback);
	}
}
prompt.get(['cmdStr'], callback);