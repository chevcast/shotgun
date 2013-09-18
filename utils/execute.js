var validateCommandOptions = require('./validateCommandOptions'),
    shellQuote = require('shell-quote'),
    optimist = require('optimist'),
    extend = require('extend');

module.exports = exports = function (cmdStr, options) {
    var shell = this;

    // If no command string was supplied then write an error message.
    if (!cmdStr || /^\s*$/.test(cmdStr))
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
        if (shell.context.prompt) {
            cmdName = shell.context.prompt.cmd;
            options = shell.context.prompt.options;
            options[shell.context.prompt.option] = cmdStr;
            shell.clearPrompt();
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
            if (validateCommandOptions(options, cmd, shell))
                return cmd.invoke(options, shell);
        }
        /// ...otherwise check to see if a passive context exists.
        else {
            // If a passive context exists then rerun 'execute' passing in the command string stored in the context...
            if (shell.context.passive)
                return shell.execute(shell.context.passive.cmdStr + ' ' + cmdStr);
            // ...otherwise it must be an invalid command.
            else
                shell.error('"' + cmdName + '" is not a valid command.');
        }
    }
    else {
        // If prompt exists then cancel it...
        if (shell.context.prompt){
            shell.warn('prompt canceled');
            shell.clearPrompt();
        }
        // If no prompt exists but a passive context exists then cancel it...
        else if (shell.context.passive) {
            shell.warn('command context canceled');
            shell.clearPassive();
        }
        // ...otherwise inform user there is no active prompt.
        else
            shell.error('there are no active prompts');

    }

    return shell;
};