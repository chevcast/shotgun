var prompt = require('prompt'),
    shotgun = require('../index'),
    shell = new shotgun.Shell({
        defaultCmds: {
            exit: false
        }
    }),
    context = {};
function callback(err, val) {
    var result = {}, exit = false;
    if (!err && val.cmdStr) {
        result = shell.execute(val.cmdStr, context);

        context = result.context;

        if (result.clearDisplay) {
            for (var i = 0; i < 50; i++) {
                console.log('\r\n');
            }
        }

        exit = result.exit;

        result.lines.forEach(function (line) {
            console[line.type](line.text);
        });
    }
    if (!exit) {
        prompt.get('cmdStr', callback);
    }
}
prompt.get('cmdStr', callback);