exports.description = 'Displays general help info or info about a specific command.';

exports.usage = '[command]';

exports.options = {
	command: {
		aliases: null,
		required: false,
		description: 'Get more information about a specific command.'
	}
};

exports.invoke = function (res, options, shell) {
	res.writeLine();
	for (var key in shell.cmds) {
		var cmd = shell.cmds[key];
		if (cmd.description) res.writeLine(key + '\t\t' + cmd.description);
	}
	res.writeLine();
};