exports.description = "A simple command module that lets the user store a message that they can later display.";

exports.invoke = function (shell, options) {
    if (options.message) {
        shell.context.setVar('message', options.message);
        shell.log("Message saved.");
    }
    else if (options.retrieve)
        shell.log("Your message was: " + shell.context.getVar('message'));
};
