var fs = require('fs'),
    path = require('path');

exports.description = "Generates a shotgun bash script scaffold at the specified path.";

exports.usage = "<path>";

exports.options = {
    path: {
        noName: true,
        required: true,
        prompt: "Enter the path where the command module should be generated.",
        description: 'The path where the command should be generated.'
    }
};

exports.invoke = function (shell, options) {
    shell.log("Reading in script template...");
    fs.readFile(path.join(__dirname, 'templates', 'basic.txt'), function (err, data) {
        if (err) return shell.error(err);
        shell.log("Done!");
        shell.log("Creating shotgun_cmds directory...");
        fs.mkdir(
            path.join(path.dirname(options.path), "shotgun_cmds"),
            function (err) {
                if (err) return shell.error(err);
                shell.log('Directory shotgun_cmds created.');
            }
        );
        shell.log("Writing script template to " + options.path);
        fs.writeFile(options.path, data, function (err) {
            if (err) return shell.error(err);
            shell.log("Script created.");
        });
    });
};
