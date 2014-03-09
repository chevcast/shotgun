var EventEmitter2 = require('eventemitter2').EventEmitter2,
    util = require('util'),
    fs = require('fs'),
    path = require('path'),
    extend = require('extend'),
    shellHelpers = require('./utils/shellHelpers'),
    execute = require('./utils/execute'),
    defaultSettings = require('./settings');

// Define the shell object.
module.exports.Shell = function (options) {

    // Alias 'this' so we can access in other scopes.
    var shell = this;

    // Invoke event emitter constructor.
    EventEmitter2.call(this);

    // Attach settings to shell.
    shell.settings = extend(true, {}, defaultSettings, options);

    // This property will store all the available command modules.
    shell.cmds = {};

    // Initialize shell helper methods.
    shellHelpers.loadHelpers(shell);

    // If shotgun is running in the browser then don't auto-load command modules.
    if (typeof(window) === 'undefined') {
        // Load custom command modules.
        shell.loadCommandModules(shell.settings.cmdsDir);

        // Load command modules installed from npm.
        if (shell.settings.loadNpmCmds) {
            var nodeModulesDir = path.resolve(__dirname, '..');
            var nodeModules = fs.readdirSync(nodeModulesDir);
            if (nodeModules)
                nodeModules.forEach(function (module) {
                    if (module.indexOf('shotguncmd-') === 0)
                        shell.loadCommandModule(path.resolve(nodeModulesDir, module));
                });
        }
    }

    // Load default command modules.
    if (shell.settings.defaultCmds.help && !shell.cmds.help)
        shell.registerCmd('help', require('./default_cmds/help.js'));
    if (shell.settings.defaultCmds.exit && !shell.cmds.exit)
        shell.registerCmd('exit', require('./default_cmds/exit.js'));
    if (shell.settings.defaultCmds.clear && !shell.cmds.clear)
        shell.registerCmd('clear', require('./default_cmds/clear.js'));

    // Define the execute function that the application will call and pass in user input.
    shell.execute = execute;

};

// Make Shell an EventEmitter2.
util.inherits(module.exports.Shell, EventEmitter2);
