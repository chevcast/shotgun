exports.description = 'Displays general help info or info about a specific command.';

exports.usage = '[command]';

exports.options = {
    command: {
        noName: true,
        description: 'Get more information about a specific command.'
    }
};

exports.invoke = function (options, shell) {
    var cmdNames = [];

    // Populate cmdNames with all command module names and sort the array alphabetically.
    for (var key in shell.cmds)
        if (shell.cmds.hasOwnProperty(key))
            cmdNames.push(key);
    cmdNames.sort();

    shell.log();

    // If no command was passed in as an argument to the help command then display the generic help menu listing all available commands.
    if (!options.command) {

        // Calculate the length of the largest command name for formatting purposes.
        var maxLength = 0;
        for (var index = 0; index < cmdNames.length; index++) {
            var cmdName = cmdNames[index];
            maxLength = cmdName.length > maxLength ? cmdName.length : maxLength;
        }

        // Iterate over all command modules and add a line of text with the command name and description.
        for (var index = 0; index < cmdNames.length; index++) {
            var cmdName = cmdNames[index],
                cmd = shell.cmds[cmdName],
                helpStr = cmdName;
            if (cmd.description) {
                helpStr += new Array((maxLength - cmdName.length) + 7).join(' ');
                helpStr += cmd.description;
            }

            // If the command is not hidden then add the line.
            // If there are 5 commands or less then type the lines character by character.
            // If there are more than 5 commands then do not type them out as it takes too long and the effect isn't worth the wait.
            if (!cmd.hidden)
                shell.log(helpStr, { dontType: cmdNames.length > 5 });
        }
        shell.log();
    }
    // If a command was passed in as an argument to the help command then display more specific help information for the specified command.
    else {
        var cmd = shell.cmds[options.command];
        if (!cmd)
            shell.error(options.command + ' is not a valid command name.');
        else {

            // Display the command's description if it has one.
            if (cmd.description) {
                shell.log(cmd.description);
                shell.log();
            }

            // If a "usage key" is specified then display it.
            if (cmd.usage) {
                shell.log('Usage: "' + options.command + ' ' + cmd.usage + '"');
                shell.log();
            }

            // If the command defines options that it recognizes then iterate over those and display information about them.
            if (cmd.options) {
                var strs = [],
                    maxLength = 0;
                for (var key in cmd.options) {
                    var option = cmd.options[key];
                    if (!option.hidden) {
                        var optionStr = (key.length > 1 ? '--' : '-') + key;
                        if (option.aliases) {
                            option.aliases.forEach(function (alias) {
                                optionStr += ',' + (alias.length > 1 ? '--' : '-') + alias;
                            });
                        }
                        strs.push({ option: option, str: optionStr});
                        maxLength = optionStr.length > maxLength ? optionStr.length : maxLength;
                    }
                }
                if (strs.length > 0) {
                    shell.log('Options:');
                    shell.log();
                    for (var index in strs) {
                        var option = strs[index].option,
                            optionStr = strs[index].str;
                        if (option.description) {
                            optionStr += new Array((maxLength - optionStr.length) + 5).join(' ');
                            optionStr += option.description;
                        }
                        shell.log(optionStr, { dontType: true });
                    }
                    shell.log();
                }
            }
        }
    }
};