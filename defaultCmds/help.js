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
        var maxLength = 0;
        for (var key in shell.cmds)
            maxLength = key.length > maxLength ? key.length : maxLength;
        for (var key in shell.cmds) {
            var cmd = shell.cmds[key],
                helpStr = key;
            if (cmd.description) {
                helpStr += new Array((maxLength - key.length) + 7).join(' ');
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
                var strs = [],
                    maxLength = 0;
                for (var key in cmd.options) {
                    var option = cmd.options[key],
                        optionStr = (key.length > 1 ? '--' : '-') + key;
                    if (option.aliases) {
                        option.aliases.forEach(function (alias) {
                            optionStr += ',' + (alias.length > 1 ? '--' : '-') + alias;
                        });
                    }
                    strs.push({ option: option, str: optionStr});
                    maxLength = optionStr.length > maxLength ? optionStr.length : maxLength;
                }
                for (var index in strs) {
                    var option = strs[index].option,
                        optionStr = strs[index].str;
                    if (option.description) {
                        optionStr += new Array((maxLength - optionStr.length) + 5).join(' ');
                        optionStr += option.description;
                    }
                    res.log(optionStr);
                }
            }
        }
    }
};