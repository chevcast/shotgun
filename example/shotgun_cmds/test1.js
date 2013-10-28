exports.options = {
    msg: {
        type: 'string'
    }
};

exports.invoke = function (shell, options) {
    shell.log(typeof options.msg);
    shell.log(options.msg);
};