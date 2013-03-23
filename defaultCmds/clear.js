exports.description = 'Clears the display.';

exports.invoke = function (res, options, shell) {
    res.lines = [];
    res.clearDisplay = true;
    res.resetContext();
};