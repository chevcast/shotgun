//var msg = '-m "this is a message" --echo "another message" test arg';
//var ary = msg.match(/"[^"]*"|[^\s]+/g);
//ary.map(function (item) {
//	item = item.replace(/^"|"$/g, '');
//});
//console.log(ary);
//http://stackoverflow.com/questions/15420504/how-do-i-split-a-string-by-space-in-javascript-except-when-the-spaces-occur-bet/15421948?noredirect=1#15421948

module.exports = function (dir) {
	this.execute = function (cmd, options) {
		return options;
	};
	this.commands = [];
};