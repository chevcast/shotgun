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
    // By default all command modules are accessible.
    defaultCmdAccess: true,
    // Optional function for parsing command options.
    parseOptions: false
};