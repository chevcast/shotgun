//module.exports = function (dir) {
//	this.execute = function (cmd, options) {
//		return options;
//	};
//	this.commands = [];
//};

// For parsing strings that did not come from process.argv
function parseString(str) {
	var re = /(?:")([^"]+)(?:")|([^\s"]+)(?=\s+|$)/g;
	var res=[], arr=null;
	while (arr = re.exec(str)) { res.push(arr[1] ? arr[1] : arr[0]); }
	return res;
}

var optimist = require('optimist');
var result = optimist(process.argv)
	.usage('echo [-m <message>]')
	.options('m', {
		demand: true,
		alias: 'message',
		describe: 'Messages are for cool people'
	})
	.argv;
console.log(result);