exports.description = 'Exits the application.';

exports.invoke = function (res, options, shell) {
    res.exit = true;
};