//var optimist = require('optimist'),
//	shellQuote = require('shell-quote');
//var msg = '-abc --verbose -m "this is a test" hello there!';
//var result = optimist(shellQuote.parse(msg)).argv;
//console.log(result);

var fs = require('fs'),
	path = require('path'),
	optimist = require('optimist'),
	shellQuote = require('shell-quote'),
	extend = require('node.extend');

module.exports.Shell = function (cmdsDir) {
	var self = this;

	self.cmds = {};

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

	self.execute = function (cmdStr, options, context) {
		var res = {
				context: context || {},
				lines: []
			};

		res.log = function (text, options) {
			res.lines.push({
				options: options,
				type: 'log',
				text: text || ''
			});
		};
		res.error = function (text, options) {
			res.lines.push({
				options: options,
				type: 'error',
				text: text || ''
			});
		};
		res.warn = function (text, options) {
			res.lines.push({
				options: options,
				type: 'warn',
				text: text || ''
			});
		};

		if (!cmdStr)
			res.error('You must supply a value.');

		var	args = shellQuote.parse(cmdStr),
			cmdName = args[0];

		if (context && context.promptVar) {
			cmdName = context.cmdName;
			options = context.options;
			options[context.promptVar] = cmdStr;
		}
		else {
			args.splice(0,1);
			options = extend(optimist(args).argv, options);
		}

		var cmd = self.cmds[cmdName.toLowerCase()];

		if (cmd) {
			var okToInvoke = true;
			if (cmd.options) {
				var nonNamedIndex = 0;
				for (var key in cmd.options) {
					var definedOption = cmd.options[key];

					// If option has named=false, attach non-named parameters as option and remove from `options._` array.
					if (!(key in options) && definedOption.nodash && options._.length > 0) {
						options[key] = options._[nonNamedIndex];
						options._.splice(nonNamedIndex, 1);
					}

					// If defined option was not supplied and it has aliases, check if aliases were supplied and attach option.
					if (!definedOption.nodash && !(key in options) && definedOption.aliases) {
						definedOption.aliases.forEach(function (alias) {
							if (alias in options) {
								options[key] = options[alias];
								delete options[alias];
							}
						});
					}

					// If option has default value and was not found in supplied options then assign it.
					if (definedOption.default && !(key in options))
						options[key] = definedOption.default;

					// If defined option has a validate expression or function then test our option value against it.
					if (definedOption.validate && (definedOption.required || (key in options))) {
						if (definedOption.validate instanceof RegExp) {
							if (!definedOption.validate.test(options[key])) {
								okToInvoke = false;
								res.error('Invalid value for "' + key + '"');
							}
						}
						else if (typeof(definedOption.validate) == 'function') {
							try {
								if (!definedOption.validate(options[key])) {
									okToInvoke = false;
									res.error('Invalid value for "' + key + '"');
								}
							}
							catch (ex) {
								okToInvoke = false;
								res.error('Invalid value for "' + key + '"');
							}
						}
					}

					// If option is required but is not found in supplied options then error.
					if (definedOption.required && !(key in options)) {
						okToInvoke = false;
						res.error('Missing parameter "' + key + '"');
					}
				}
			}

			res.prompt = function () {
				var promptVar = arguments[0],
					promptMsg = arguments.length > 2 ? arguments[1] : 'Please enter ' + promptVar + '.',
					callback = arguments.length == 2 ? arguments[1] : arguments[2];

				if (promptVar in options) {
					res.context = {};
					callback(options[promptVar]);
				}
				else {
					res.context.cmdName = cmdName;
					res.context.options = options;
					res.context.promptVar = promptVar;
					res.log(promptMsg);
				}
			};
//			res.passive = function (promptVar, callback) {
//				// Check (promptVar in options).
//				// If promptVar exists then invoke callback(options[promptVar]);
//				// else set passive context.
//			};

			if (okToInvoke) cmd.invoke(res, options, self);
		}
		else
			res.error('"' + cmdName + '" is not a valid command.');

		return res;

	};
};