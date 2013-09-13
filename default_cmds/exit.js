exports.description = 'Exits the application.';

exports.invoke = function (options, shell, done) {
    this.exit = true;
    done();
};