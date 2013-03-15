//var optimist = require('optimist'),
//	shellQuote = require('shell-quote');
//var msg = '-abc --verbose -m "this is a test" hello there!';
//var result = optimist(shellQuote.parse(msg)).argv;
//console.log(result);

var fs = require('fs'),
	path = require('path'),
	optimist = require('optimist'),
	shellQuote = require('shell-quote');

module.exports = function (cmdsDir) {
	var self = this;

	self.cmds = {};
	self.context = {};

	function readCommands(dir) {
		var files = fs.readdirSync(dir);
		if (files)
			files.forEach(function(file) {
				var cmd = require(path.resolve(dir, file));
				if (cmd && cmd.invoke)
					self.cmds[path.basename(file, '.js').toLowerCase()] = cmd;
				else
					console.warn('"%s" is not compatible with shotgun-shell and was not loaded.', file);
			});
	}

	readCommands(path.resolve(__dirname, 'cmds'));
	readCommands(cmdsDir || 'cmds');

	self.execute = function (cmdStr, options) {
		if (!cmdStr) return {};
		var res = {
				context: self.context,
				lines: []
			},
			args = shellQuote.parse(cmdStr),
			name = args[0],
			cmd = self.cmds[name.toLowerCase()];

		args.splice(0,1);
		res.writeLine = function (text, displayOptions) {
			res.lines.push({
				displayOptions: displayOptions,
				text: text || ''
			});
		};

		//todo: extend options with argv
		options = optimist(args).argv;
		/* todo:
			- loop through cmd options.
			- Verify all required options.
			- Add unnamed options from argv to options as named options.
		 */

		if (cmd) cmd.invoke(res, options, self);
		else res.writeLine('"' + name + '" is not a valid command.');
		return res;
	};
};