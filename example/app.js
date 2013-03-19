var shotgun = require('../index'),
	prompt = require('prompt');

var shell = new shotgun.Shell('cmds');

var context = {};

function callback(err, val) {
	prompt.pause();
	var exit = false;

	if (val.cmdStr && !err) {

		// Call into shotgun.
		var result = shell.execute(val.cmdStr, {}, context);

		// Use Shotgun's result object to do stuff. Like display text to screen.
		context = result.context;
		if (result.clearDisplay) console.warn('clear is not supported');
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