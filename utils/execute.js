var validateCommandOptions = require('./validateCommandOptions'),
    shellQuote = require('shell-quote'),
    optimist = require('optimist'),
    extend = require('extend'),
    shellHelpers = require('./shellHelpers');

module.exports = exports = function (cmdStr, context, options) {
    var shell = this;

    // Initialize shell helper methods.
    if (context) shellHelpers.updateContext(context);

    var prompt = shell.getVar('prompt');

    // If no command string was supplied then write an error message.
    if (!cmdStr || /^[\s';"\[\]|&()<>]+$/.test(cmdStr))
        return shell.error('You must supply a value.');

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
        // ...otherwise remove the command name from the args array and build our options object.
        else {
            args.splice(0, 1);
            options = extend({}, optimist(args).argv, options);
        }

        // Get reference to the command module by name.
        var cmd = shell.cmds[cmdName.toLowerCase()];
        // If the command module exists then process it's options and invoke the module.
        if (cmd && cmd.access(shell, cmdName.toLowerCase())) {
            if (options.hasOwnProperty('?') || options.hasOwnProperty('help'))
                shell.execute('help', context, { command: cmdName });
            else if (validateCommandOptions(options, cmd, shell))
                cmd.invoke(shell, options);
        }
        else
            shell.error('"' + cmdName + '" is not a valid command');
    }
    else {
        // If prompt exists then cancel it...
        if (prompt){
            shell.warn('prompt canceled');
            shell.clearPrompt();
        }
        // ...otherwise inform user there is no active prompt.
        else
            shell.error('there are no active prompts');

    }

    return shell;
};