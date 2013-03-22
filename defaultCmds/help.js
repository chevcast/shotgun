exports.description = 'Displays general help info or info about a specific command.';

exports.usage = '[command]';

exports.options = {
    command: {
        nodash: true,
        description: 'Get more information about a specific command.'
    }
};

exports.invoke = function (res, options, shell) {
    if (!options.command) {
        for (var key in shell.cmds) {
            var cmd = shell.cmds[key],
                helpStr = key;
            if (cmd.description) {
                for (var count = 0; count < (20 - key.length); count++) {
                    helpStr += ' ';
                }
                helpStr += cmd.description;
            }
            res.log(helpStr);
        }
    }
    else {
        var cmd = shell.cmds[options.command];
        if (!cmd)
            res.error(options.command + ' is not a valid command name.');
        else {
            if (cmd.description) {
                res.log(cmd.description);
                res.log();
            }
            if (cmd.usage) {
                res.log(options.command + ' ' + cmd.usage);
                res.log();
            }
            if (cmd.options) {
                for (var key in cmd.options) {
                    var option = cmd.options[key], optionStr = (key.length > 1 ? '--' : '-') + key;
                    if (option.aliases) {
                        option.aliases.forEach(function (alias) {
                            optionStr += ', ' + (alias.length > 1 ? '--' : '-') + alias;
                        });
                    }
                    if (option.description) {
                        var length = optionStr.length;
                        for (var count = 0; count < (20 - length); count++) {
                            optionStr += ' ';
                        }
                        optionStr += option.description;
                    }
                    res.log(optionStr);
                }
            }
        }
    }
};