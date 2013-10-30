var validateCommandOptions = require('./validateCommandOptions'),
    shellQuote = require('shell-quote'),
    extend = require('extend'),
    shellHelpers = require('./shellHelpers');

module.exports = exports = function (cmdStr, context, options) {

    // Remove optimist from the module cache so it won't remember options we defined during last execution.
    for (var key in require.cache)
        if (key.match(/optimist\\index\.js$/))
            delete require.cache[key];

    var shell = this,
        optimist = require('optimist'); // Get fresh reference to optimist with every execution.

    // Todo: Modify optimist with a clearOptions function. When pull request is accepted put the require back at the top and remove the code to invalidate the cache. Then make a call to the new optimist function instead.

    // Initialize shell helper methods.
    if (context) shellHelpers.updateContext(context);

    var prompt = shell.getVar('prompt');

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
            // Configure optimist based on defined command options.
            if (cmd && cmd.hasOwnProperty('options')) {
                for (var key in cmd.options) {
                    if (cmd.options.hasOwnProperty(key)) {
                        var option = cmd.options[key];
                        if (option.hasOwnProperty('type'))
                            switch(option.type.toLowerCase()) {
                                case "string":
                                    optimist.string(key);
                                    if (option.hasOwnProperty('aliases'))
                                        optimist.string(option.aliases);
                                    break;
                                case "boolean":
                                    optimist.boolean(key);
                                    if (option.hasOwnProperty('aliases'))
                                        optimist.boolean(option.aliases);
                            }
                    }
                }
            }
            // Set options by extending the parsed user options with the manually supplied options.
            options = extend({}, optimist.parse(args), options);
        }

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