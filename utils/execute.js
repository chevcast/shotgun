var validateCommandOptions = require('./validateCommandOptions'),
    shellQuote = require('shell-quote'),
    yargs = require('yargs'),
    extend = require('extend');

module.exports = exports = function (cmdStr, contextData, options) {

    var shell = this;

    if (contextData) shell.context.data = contextData;

    yargs.resetOptions();

    shell.context.getVar('prompt', function (prompt) {

        // If no command string was supplied then write an error message.
        if (!prompt && (!cmdStr || /^[\s';"\[\]|&<>]+$|[()]/g.test(cmdStr)))
            return shell.error('Invalid input.');

        // Parse the command string into an argument array and set the command name to the first item.
        var args = cmdStr,
            cmdName = cmdStr;
        if (cmdStr.length > 0) {
            args = shellQuote.parse(cmdStr);
            cmdName = args[0];
        }

        if (cmdStr.toLowerCase() !== 'cancel') {
            // If a prompt context exists then override command and options with those stored in the context...
            if (prompt) {
                cmdName = prompt.cmd;
                options = prompt.options;
                options[prompt.option] = cmdStr;
                shell.clearPrompt();
            }

            // Get reference to the command module by name.
            var cmd = shell.cmds[cmdName.toLowerCase()];

            // ...otherwise remove the command name from the args array and build our options object.
            if (!prompt) {
                args.splice(0, 1);
                // Configure yargs based on defined command options.
                if (cmd && cmd.hasOwnProperty('options')) {
                    for (var key in cmd.options) {
                        if (cmd.options.hasOwnProperty(key)) {
                            var option = cmd.options[key];
                            if (option.hasOwnProperty('type'))
                                switch(option.type.toLowerCase()) {
                                    case "string":
                                        yargs.string(key);
                                        if (option.hasOwnProperty('aliases'))
                                            yargs.string(option.aliases);
                                        break;
                                    case "boolean":
                                        yargs.boolean(key);
                                        if (option.hasOwnProperty('aliases'))
                                            yargs.boolean(option.aliases);
                                }
                        }
                    }
                }
                // Set options by extending the parsed user options with the manually supplied options.
                options = extend({}, yargs.parse(args), options);
            }

            // If the command module exists then process it's options and invoke the module.
            if (cmd && cmd.access(shell, cmdName.toLowerCase())) {
                if (options.hasOwnProperty('?') || options.hasOwnProperty('help'))
                    shell.execute('help', context, { command: cmdName });
                else if (validateCommandOptions(options, cmd, shell))
                    try {
                        cmd.invoke(shell, options);
                    } catch (err) {
                        shell.error(err);
                    }
            }
            else
                shell.log('"' + cmdName + '" is not a valid command', { type: 'error' });
        }
        else {
            // If prompt exists then cancel it...
            if (prompt){
                shell.log('prompt canceled', { type: 'warn' });
                shell.clearPrompt();
            }
            // ...otherwise inform user there is no active prompt.
            else
                shell.log('there are no active prompts', { type: 'warn' });

        }

        // Emit a done event to signal we are finished with this execution.
        shell.emit('done');

    });

    return shell;
};
