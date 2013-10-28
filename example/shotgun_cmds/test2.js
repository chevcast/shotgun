exports.options = {
    msg: {
        type: 'number'
    }
};

exports.invoke = function (shell, options) {
    shell.log(typeof options.msg);
    shell.log(options.msg);
};