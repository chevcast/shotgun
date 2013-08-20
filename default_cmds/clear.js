exports.description = 'Clears the display.';

exports.invoke = function (options, shell) {
    this.lines = [];
    this.clearDisplay = true;
    this.resetContext();
};