exports.description = 'Clears the display.';

exports.invoke = function (options, shell, done) {
    this.lines = [];
    this.clearDisplay = true;
    this.resetContext();
    done();
};