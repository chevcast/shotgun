var fs = require('fs'),
    path = require('path');

module.exports = exports = function (shell) {
    // Load custom command modules.
    shell.loadCommandModules(shell.settings.cmdsDir);

    // Load default command modules.
    for (var key in shell.settings.defaultCmds) {
        if (shell.settings.defaultCmds[key])
            shell.loadCommandModule(path.resolve(__dirname, '..', 'default_cmds', key));
    }

    // Load npm command modules.
    if (shell.settings.loadNpmCmds) {
        var nodeModules = fs.readdirSync(path.resolve(__dirname, '..', '..'));
        if (nodeModules)
            nodeModules.forEach(function (module) {
                if (module.indexOf('shotguncmd-') === 0)
                    shell.loadCommandModule(path.resolve(__dirname, '..', module));
            });
    }
};