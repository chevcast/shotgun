var fs = require('fs'),
    path = require('path');

exports.description = "Generates a shotgun shell script scaffold at the specified path.";

exports.usage = "<path>";

exports.options = {
    path: {
        noName: true,
        required: true,
        prompt: "Enter the path where the shell script should be generated.",
        description: 'The path where the shell script should be generated.'
    }
};

exports.invoke = function (shell, options) {
    shell.log("Reading in shell script template...");
    fs.readFile(path.join(__dirname, 'templates', 'basic.txt'), function (err, data) {
        if (err) return shell.error(err);
        shell.log("Done!");
        var cmdsDir = path.join(path.dirname(options.path), "shotgun_cmds");
        fs.exists(cmdsDir, function (exists) {
            if (exists)
                return shell.log("shogtun_cmds exists, skipping creation.");
            shell.log("Creating shotgun_cmds directory...");
            fs.mkdir(cmdsDir, function (err) {
                if (err) return shell.error(err);
                shell.log('Directory shotgun_cmds created.');
            });
        });
        shell.log("Writing script template to " + options.path);
        fs.writeFile(options.path, data, function (err) {
            if (err) return shell.error(err);
            shell.log("Shell script created.");
        });
    });
};
