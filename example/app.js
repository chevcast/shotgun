var shotgun = require('../index'),
	prompt = require('prompt');

var shell = new shotgun.Shell('cmds');

function callback(err, v) {
	prompt.pause();
	var exit = false;
	if (v.cmdStr) {
		var result = shell.execute(v.cmdStr, { msg: 'Yay it worked!' });
		if (result.clearDisplay) require('util').print("\u001b[2J\u001b[0;0H");
		exit = result.exit;
		result.lines.forEach(function (line) {
			console.log(line.text);
		});
	}
	if (!exit) {
		prompt.start();
		prompt.get(['cmdStr'], callback);
	}
}
prompt.get(['cmdStr'], callback);