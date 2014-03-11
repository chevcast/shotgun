#!/usr/bin/env node

var shotgun = require('../'),
    path = require('path'),
    readline = require('readline');

var shell = new shotgun.Shell({
    cmdsDir: path.join(__dirname, 'shotgun_cmds'),    
    defaultCmds: {
        exit: false,
        clear: false
    },
    debug: true
});

var args = process.argv;
args.splice(0, 2);
var cmdStr = args.join(' ');

shell
    .on('error', console.error.bind(console))
    .on('clear', function () {
        console.log('\u001B[2J\u001B[0;0f');
    })
    .on('log', function (text, options) {
        console.log(text);
    })
    .on('done', function (isPrompt) {
        if (!isPrompt) return;
        var rl = readline.createInterface(process.stdin, process.stdout);
        rl.on('line', function (userInput) {
            rl.close();
            shell.execute(userInput);
        });
        rl.prompt();
    });

shell.execute(cmdStr);
