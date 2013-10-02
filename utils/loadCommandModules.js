var fs = require('fs'),
    path = require('path');

module.exports = exports = function (shell) {
    // Load custom command modules.
    shell.loadCommandModules(shell.settings.cmdsDir);

    // Load default command modules.
    for (var key in shell.settings.defaultCmds) {
        if (shell.settings.defaultCmds[key] && !shell.cmds.hasOwnProperty(key))
            shell.loadCommandModule(path.resolve(__dirname, '..', 'default_cmds', key + '.js'));
    }

    // Load npm command modules.
    if (shell.settings.loadNpmCmds) {
        var nodeModulesDir = path.resolve(__dirname, '..', '..');
        var nodeModules = fs.readdirSync(nodeModulesDir);
        if (nodeModules)
            nodeModules.forEach(function (module) {
                if (module.indexOf('shotguncmd-') === 0)
                    shell.loadCommandModule(path.resolve(nodeModulesDir, module));
            });
    }
};