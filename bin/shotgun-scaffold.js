#!/usr/bin/env node

var shotgun = require('../'),
    path = require('path'),
    readline = require('readline');

var shell = new shotgun.Shell({
    cmdsDir: path.join(__dirname, 'scaffold_cmds'),
    defaultCmds: {
        exit: false,
        clear: false
    }
});

var args = process.argv;
args.splice(0, 2);
var cmdStr = args.join(' ');

var isPrompt = false;

shell
    .on('error', console.error.bind(console))
    .on('clear', function () {
        console.log('\u001B[2J\u001B[0;0f');
    })
    .on('log', function (text, options) {
        console.log(text);
    })
    .on('contextChanged', function (context) {
        isPrompt = context.hasOwnProperty('prompt');
    })
    .on('done', function () {
        if (!isPrompt) return;
        
        isPrompt = false;
        var rl = readline.createInterface(process.stdin, process.stdout);
        rl.on('line', function (userInput) {
            rl.close();
            shell.execute(userInput);
        });
        rl.prompt();
    });

shell.execute(cmdStr);
