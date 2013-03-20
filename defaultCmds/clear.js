exports.description = 'Clears the display.';

exports.invoke = function (res, options, shell) {
    res.clearDisplay = true;
    res.resetContext();
};