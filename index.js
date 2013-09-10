var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist'),
    shellQuote = require('shell-quote'),
    extend = require('extend'),
    CommandResponse = require('./CommandResponse'),
    defaultOptions = {
        namespace: 'shotgun',
        cmdsDir: 'shotgun_cmds',
        defaultCmds: {
            clear: true,
            help: true,
            exit: true
        },
        helpers: {},
        debug: false
    };

// Define the shell object.
module.exports.Shell = function (options) {

    // Alias 'this' so we can access in other scopes.
    var shell = this;

    // Extend default options with user supplied options.
    var settings = extend(true, {}, defaultOptions, options);

    // Set namespace for this shell instance. If no namespace is supplied then use the cmdsDir.
    // If no cmdsDir is specified then use 'cmds' by default.
    shell.namespace = settings.namespace;

    // Set the helpers property for the shell.
    shell.helpers = settings.helpers;

    // This property will store all the available command modules.
    shell.cmds = {};

    // Load specified command module into shell.cmds.
    shell.loadCommandModule = function(cmdPath) {
        var cmd = require(cmdPath);
        var cmdName = path.basename(cmdPath, '.js').toLowerCase();
        if (cmd && cmd.invoke) {
            cmd.name = cmdName.toLowerCase();
            shell.cmds[cmdName] = cmd;
        }
        else if (settings.debug)
            console.warn('%s.js is not a valid shotgun command module and was not loaded.', cmdName);
    };

    // Reads all command modules from the specified directory and loads them.
    shell.readCommandModules = function(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir);
            if (files) {
                files.forEach(function (file) {
                    shell.loadCommandModule(path.resolve(dir, file));
                });
            }
        }
    };

    // Load default command modules.
    for (var key in settings.defaultCmds) {
        if (settings.defaultCmds[key])
            shell.loadCommandModule(path.resolve(__dirname, 'default_cmds', key + '.js'));
    }

    // Load custom command modules.
    shell.readCommandModules(settings.cmdsDir);

    // The main entry point into Shotgun.
    // cmdStr - the user-provided command string, with arguments.
    // options - properties on the options object will override user-provided arguments.
    // context - this object is used to maintain state across multiple executions. Pass in res.context.
    shell.execute = function (cmdStr, context, options) {

        // If no context was supplied then create one.
        if (!context) context = {};

        // Define our response object. This is the object we will return.
        var res = new CommandResponse(context);
        extend(res, shell.helpers);

        // If no command string was supplied then write an error message.
        if (!cmdStr)
            res.error('You must supply a value.');

        // Parse the command string into an argument array and set the command name to the first item.
        var args = cmdStr,
            cmdName = cmdStr;
        if (cmdStr.length > 0) {
            args = shellQuote.parse(cmdStr);
            cmdName = args[0];
        }

        if (cmdStr.toLowerCase() !== 'cancel') {
            // If a prompt context exists then override command and options with those stored in the context...
            if (context.prompt) {
                cmdName = context.prompt.cmd;
                options = context.prompt.options;
                options[context.prompt.option] = cmdStr;
                delete res.context.prompt;
            }
            // ...otherwise remove the command name from the args array and build our options object.
            else {
                args.splice(0, 1);
                options = extend(optimist(args).argv, options);
            }

            // Get reference to the command module by name.
            var cmd = shell.cmds[cmdName.toLowerCase()];

            // If the command module exists then process it's options and invoke the module...
            if (cmd) {
                if (validateOptions(res, options, cmd))
                    cmd.invoke.call(res, options, shell);
            }
            /// ...otherwise check to see if a passive context exists.
            else {
                // If a passive context exists then rerun 'execute' passing in the command string stored in the context...
                if (context.passive)
                    res = shell.execute(context.passive.cmdStr + ' ' + cmdStr, context);
                // ...otherwise it must be an invalid command.
                else
                    res.error('"' + cmdName + '" is not a valid command.');
            }
        }
        else {
            // If prompt exists then cancel it...
            if (context.prompt){
                res.warn('prompt canceled');
                delete res.context.prompt;
            }
            // ...otherwise inform user there is no active prompt.
            else
                res.error('no active prompt');

        }

        // Return our result object to the application.
        return res;
    };

    function validateOptions (res, options, cmd) {

        // If the command has pre-defined options then parse through them and validate against the supplied options.
        if (cmd.options) {

            var nonNamedIndex = 0;

            // Loop through the command's pre-defined options.
            for (var key in cmd.options) {

                // The option defined by the command.
                var definedOption = cmd.options[key];

                // If option has named=false, attach non-named parameters as option and remove from `options._` array.
                if (!(key in options) && definedOption.noName && options._.length > 0) {
                    options[key] = options._[nonNamedIndex];
                    options._.splice(nonNamedIndex, 1);
                }

                // If defined option was not supplied and it has aliases, check if aliases were supplied and attach option.
                if (!definedOption.noName && !(key in options) && definedOption.aliases) {
                    definedOption.aliases.forEach(function (alias) {
                        if (alias in options) {
                            options[key] = options[alias];
                            delete options[alias];
                        }
                    });
                }

                // Prompt the user for value if:
                // A) The option was not supplied and it is required.
                // B) The option was supplied but without a value.
                if (definedOption.prompt) {
                    if ((!(key in options) && definedOption.required) || (key in options && options[key] === true)) {
                        res.context.prompt = {
                            option: key,
                            cmd: cmd.name,
                            options: options
                        };
                        if (definedOption.password)
                            res.password = true;
                        if (typeof(definedOption.prompt) !== 'boolean')
                            res.log(definedOption.prompt);
                        else
                            res.log('Enter value for ' + key + '.');
                        // Return immediately without further validation.
                        return false;
                    }
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
                            res.error('invalid value for "' + key + '"');
                            return false;
                        }
                    }
                    // If defined validation is a function then pass the value to it.
                    else if (typeof(definedOption.validate) == 'function') {
                        try {
                            // If the validation function returns false then do not invoke the command and write
                            // error message.
                            var validationResult = definedOption.validate(options[key], options);
                            if (validationResult !== true) {
                                if (typeof(validationResult) !== 'string')
                                    res.error('invalid value for "' + key + '"');
                                else
                                    res.error(validationResult);
                                return false;
                            }
                        }
                        // If the provided validation function throws an error at any point then handle it
                        // gracefully and simply fail validation.
                        catch (ex) {
                            res.error('invalid value for "' + key + '"');
                            return false;
                        }
                    }
                }

                // If option is required but is not found in supplied options then error.
                if (definedOption.required && !(key in options)) {
                    res.error('missing parameter "' + key + '"');
                    return false;
                }
            }
        }
        // If we made it this far then all options are valid so return true.
        return true;
    }
};