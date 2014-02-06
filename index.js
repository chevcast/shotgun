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
    shell.settings = extend(true, {}, defaultSettings, options);;

    // This property will store all the available command modules.
    shell.cmds = {};

    // Initialize shell helper methods.
    shellHelpers.loadHelpers(shell);

    // Load custom command modules.
    shell.loadCommandModules(shell.settings.cmdsDir);

    // Load default command modules.
    for (var key in shell.settings.defaultCmds) {
        if (shell.settings.defaultCmds[key] && !shell.cmds.hasOwnProperty(key))
            shell.loadCommandModule(path.resolve(__dirname, 'default_cmds', key + '.js'));
    }

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

    // Define the execute function that the application will call and pass in user input.
    shell.execute = execute;

};

// Make Shell an EventEmitter2.
util.inherits(module.exports.Shell, EventEmitter2);
