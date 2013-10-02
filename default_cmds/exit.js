exports.description = 'Exits the application.';

exports.invoke = function (shell) {
    shell.exit();
};