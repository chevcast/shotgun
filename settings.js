module.exports = exports = {
    namespace: "shotgun",
    cmdsDir: "shotgun_cmds",
    defaultCmds: {
        clear: true,
        help: true,
        exit: true
    },
    loadNpmCmds: true,
    debug: false,
    // By default all commands are available.
    canAccessCmd: function (cmdName) {
        return true;
    }
};