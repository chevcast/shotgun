var fs = require('fs'),
    path = require('path'),
    optimist = require('optimist'),
    shellQuote = require('shell-quote'),
    extend = require('extend'),
    CommandResult = require('./CommandResult'),
    validateOptions = require('./validateOptions'),
    defaultOptions = {
        namespace: 'shotgun',
        cmdsDir: 'shotgun_cmds',
        defaultCmds: {
            clear: true,
            help: true,
            exit: true
        },
        loadNpmCmds: true,
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
        try {
            var cmd = require(cmdPath);
            var cmdName = path.basename(cmdPath, '.js').toLowerCase().replace(/^shotguncmd-/i, "");
            if (cmd && cmd.invoke) {
                cmd.name = cmdName.toLowerCase();
                shell.cmds[cmdName] = cmd;
            }
            else if (settings.debug)
                console.warn("%s is not a valid shotgun command module and was not loaded.", cmdPath);
        } catch (ex) {
            if (settings.debug)
                console.error("There was a problem loading %s.", cmdPath);
        }
    };

    // Reads all command modules from the specified directory and loads them.
    shell.readCommandModules = function(dir) {
        if (fs.existsSync(dir)) {
            var files = fs.readdirSync(dir);
            if (files)
                files.forEach(function (file) {
                    shell.loadCommandModule(path.resolve(dir, file));
                });
        }
    };

    // Load default command modules.
    for (var key in settings.defaultCmds) {
        if (settings.defaultCmds[key])
            shell.loadCommandModule(path.resolve(__dirname, 'default_cmds', key));
    }

    // Load npm command modules.
    if (settings.loadNpmCmds) {
        var nodeModules = fs.readdirSync(path.resolve(__dirname, '..'));
        if (nodeModules)
            nodeModules.forEach(function (module) {
                if (module.indexOf('shotguncmd-') === 0)
                    shell.loadCommandModule(path.resolve(__dirname, '..', module));
            });
    }

    // Load custom command modules.
    shell.readCommandModules(settings.cmdsDir);

    // The main entry point into Shotgun.
    // cmdStr - the user-provided command string, with arguments.
    // options - properties on the options object will override user-provided arguments.
    // context - this object is used to maintain state across multiple executions. Pass in res.context.
    shell.execute = function (cmdStr) {

        var callback, context = {}, options = {};
        switch (arguments.length) {
            case 2:
                callback = arguments[1];
                break;
            case 3:
                context = arguments[1];
                callback = arguments[2];
                break;
            case 4:
                context = arguments[1];
                options = arguments[2];
                callback = arguments[3];
                break;
        }

        // If no context was supplied then create one.
        if (!context) context = {};

        // Define our response object. This is the object we will return.
        var res = new CommandResult(context);
        extend(res, shell.helpers);

        // If no command string was supplied then write an error message.
        if (!cmdStr || /^\s*$/.test(cmdStr)) {
            res.error('You must supply a value.');
            return callback(res);
        }

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
                if (validateOptions(res, options, cmd)) {
                    var done = callback.bind({}, res);
                    return cmd.invoke.call(res, options, shell, done);
                }
            }
            /// ...otherwise check to see if a passive context exists.
            else {
                // If a passive context exists then rerun 'execute' passing in the command string stored in the context...
                if (context.passive)
                    return shell.execute(context.passive.cmdStr + ' ' + cmdStr, context, callback);
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

        // If we made it this far then no commands were invoked so call the callback.
        callback(res);
    };
};