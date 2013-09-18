var extend = require('extend'),
    registerHelperMethods = require('./utils/helperMethods'),
    loadCommandModules = require('./utils/loadCommandModules'),
    execute = require('./utils/execute'),
    settings = require('./settings');

// Define the shell object.
module.exports.Shell = function (options) {

    // Alias 'this' so we can access in other scopes.
    var shell = this;

    // Extend default options with user supplied options.
    extend(true, settings, options);

    // Attach settings to shell.
    shell.settings = settings;

    // Set namespace for this shell instance. If no namespace is supplied then use the cmdsDir.
    // If no cmdsDir is specified then use 'cmds' by default.
    shell.namespace = settings.namespace;

    // This property will store all the available command modules.
    shell.cmds = {};

    // Instantiate a blank context object.
    shell.context = {};

    // Initialize shell helper methods.
    registerHelperMethods(shell);

    // Initialize command modules.
    loadCommandModules(shell);

    // Define the execute function that the application will call and pass in user input.
    shell.execute = execute;
};