exports.description = "Simple command that fires a switchUser event which the application can handle to change users.";

// Don't worry too much about this yet. You'll learn more about custom command modules later.
exports.options = {
    username: {
        noName: true,
        required: true,
        description: "The name of the user to switch to."
    }
}

exports.invoke = function (shell, options) {
    shell.emit('switchUser', options.username, shell.context.data);
};
