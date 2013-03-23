var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist'),
    shellQuote = require('shell-quote'),
    extend = require('node.extend');

// Define the shell object.
module.exports.Shell = function (cmdsDir) {

    // Alias 'this' so we can access in other scopes.
    var self = this;

    // This property will store all the available command modules.
    self.cmds = {};

    // Reads all command modules from the specified directory and adds them to self.cmds.
    function readCommands(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir);
            if (files) {
                files.forEach(function (file) {
                    var cmd = require(path.resolve(dir, file));
                    if (cmd && cmd.invoke) {
                        var cmdName = path.basename(file, '.js').toLowerCase();
                        if (!(cmdName in self.cmds))
                            self.cmds[cmdName] = cmd;
                        else
                            console.warn('"%s" was not loaded because a command with the same name was already loaded.', dir + '/' + file);
                    }
                    else
                        console.warn('"%s" is not compatible with shotgun-shell and was not loaded.', file);
                });
            }
        }
    }

    // Read in user provided commands first.
    readCommands(cmdsDir || 'cmds');
    // Read in default commands provided by shotgun second. This way the user can define commands with the same name
    // as default commands and they will automatically override the default commands.
    readCommands(path.resolve(__dirname, 'defaultCmds'));

    // The main entry point into Shotgun.
    // cmdStr - the user-provided command string, with arguments.
    // options - properties on the options object will override user-provided arguments.
    // context - this object is used to maintain state across multiple executions. Pass in res.context.
    self.execute = function (cmdStr, context, options) {

        // Define our response object. This is the object we will return.
        var res = {
            context: {},
            lines: []
        };

        // Helper function to add simple lines of text to the res.lines array.
        res.log = function (text, options) {
            res.lines.push({
                options: options,
                type: 'log',
                text: text || ''
            });
        };
        // Helper function to add simple error text to the res.lines array.
        res.error = function (text, options) {
            res.lines.push({
                options: options,
                type: 'error',
                text: text || ''
            });
        };
        // Helper function to add simple warning text to the res.lines array.
        res.warn = function (text, options) {
            res.lines.push({
                options: options,
                type: 'warn',
                text: text || ''
            });
        };

        // Write a blank line before executing commands.
        res.log();

        // If no command string was supplied then write an error message.
        if (!cmdStr)
            res.error('You must supply a value.');

        // Parse the command string into an argument array and set the command name to the first item.
        var args = shellQuote.parse(cmdStr), cmdName = args[0];

        // If a prompt context exists then override command and options with those stored in the context...
        if (context && context.prompt) {
            if (cmdStr.toLowerCase() !== 'cancel') {
                cmdName = context.prompt.cmdName;
                options = context.prompt.options;
                options[context.prompt.var] = cmdStr;
            }
            else {
                res.warn('prompt canceled');
                if (context.prompt.previousContext)
                    res.context = context.prompt.previousContext;
            }
        }
        // ...otherwise remove the command name from the args array and build our options object.
        else {
            args.splice(0, 1);
            options = extend(optimist(args).argv, options);
        }

        // Get reference to the command module by name.
        var cmd = self.cmds[cmdName.toLowerCase()];

        // If the command module exists then process it's options and invoke the module...
        if (cmd) {
            // By default it is OK to invoke the command. This can be set false at any point if options do not pass
            // validation.
            var okToInvoke = true;

            // If the command has pre-defined options then parse through them and validate against the supplied options.
            if (cmd.options) {

                var nonNamedIndex = 0;

                // Loop through the command's pre-defined options.
                for (var key in cmd.options) {

                    // The option defined by the command.
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

                    // If defined option has a validate expression or function and the option was supplied then
                    // validate the supplied option against the expression or function.
                    if (definedOption.validate && (key in options)) {

                        // If defined validation is a regular expression then validate the supplied value against it.
                        if (definedOption.validate instanceof RegExp) {
                            // If value does not pass validation then do not invoke command and write error message.
                            if (!definedOption.validate.test(options[key])) {
                                okToInvoke = false;
                                res.error('Invalid value for "' + key + '"');
                            }
                        }
                        // If defined validation is a function then pass the value to it.
                        else if (typeof(definedOption.validate) == 'function') {
                            try {
                                // If the validation function returns false then do not invoke the command and write
                                // error message.
                                if (!definedOption.validate(options[key])) {
                                    okToInvoke = false;
                                    res.error('Invalid value for "' + key + '"');
                                }
                            }
                                // If the provided validation function throws an error at any point then handle it
                                // gracefully and simply fail validation.
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

            var promptIndex = 0;
            // Helper function to setup a prompt context.
            res.prompt = function () {

                var promptVar = 'promptVar' + promptIndex, promptMsg, callback;

                // If the user calls with two arguments then set promptVar and callback, but let promptMsg use
                // default value.
                switch (arguments.length) {
                    case 2:
                        promptMsg = arguments[0];
                        callback = arguments[1];
                        promptIndex++;
                        break;
                    case 3:
                        promptMsg = arguments[0];
                        promptVar = arguments[1];
                        callback = arguments[2];
                }

                // If the requested variable exists on the options object then immediately invoke the callback and
                // pass in the value.
                if ((promptVar in options) && (typeof(options[promptVar]) !== 'boolean')) {
                    if (context && context.prompt && context.prompt.previousContext)
                        res.context = context.prompt.previousContext;
                    callback(options[promptVar]);
                }
                // If the variable does not exist on the options object then setup a prompt context so that the next
                // user-provided value is added to the options object under that variable name.
                else {
                    res.context.prompt = {
                        cmdName: cmdName,
                        options: options,
                        var: promptVar
                    };
                    if (!context || !context.prompt)
                        res.context.prompt.previousContext = context;
                    res.log(promptMsg);
                }
            };
            // Helper function for setting up passive contexts. If the user-provided command string matches a command
            // then it will ignore the passive context and execute the matching command. If it does not match a command
            // then it will append the provided string to the contexted string and re-execute.
            res.setContext = function (cmdStr, contextMsg) {
                res.context.passive = {
                    cmdStr: cmdStr,
                    msg: contextMsg || cmdStr
                };
            };
            // Helper function to reset contexts.
            res.resetContext = function () {
                res.context = {};
            };

            // If all options passed validation then go ahead and invoke the command module.
            if (okToInvoke) cmd.invoke(res, options, self);
        }
        // ...if the command does not exist then check to see if a passive context exists.
        else {
            // If a passive context exists then rerun 'execute' passing in the command string stored in the context...
            if (context && context.passive && context.passive.cmdStr) {
                res = self.execute(context.passive.cmdStr + ' ' + cmdStr, context);
            }
            // If no context exists and the user did not provide the value 'cancel' then write invalid command error.
            else if (cmdName.toLowerCase() !== 'cancel')
                res.error('"' + cmdName + '" is not a valid command.');
        }

        // Return our result object to the application.
        return res;
    };
};