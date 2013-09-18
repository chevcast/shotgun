exports.description = 'Clears the display.';

exports.invoke = function (options, shell) {
    shell.clearDisplay();
    shell.clearPrompt();
    shell.clearPassive();
};