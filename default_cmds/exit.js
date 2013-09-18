exports.description = 'Exits the application.';

exports.invoke = function (options, shell) {
    shell.exit();
};