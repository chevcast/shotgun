module.exports = exports = function (str) {
    var args = Array.prototype.slice.call(arguments, 1);
    return str.replace(/\{([0-9]+)\}/g, function (match, index) {
        return args[parseInt(index)];
    });
};