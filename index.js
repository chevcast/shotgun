var msg = '-m "this is a message" --echo "another message" test arg';
var ary = msg.match(/"[^"]*"|[^\s]+/g);
ary.map(function (item) {
	item = item.replace(/^"|"$/g, '');
});
console.log(ary);