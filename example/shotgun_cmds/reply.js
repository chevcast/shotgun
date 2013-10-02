exports.description = "Allows you to reply to the most recently viewed topic.";

exports.usage = "[content]";

exports.options = {
    content: {
        required: true,
        prompt: "Enter your reply.",
        noName: true,
        hidden: true
    }
};

exports.invoke = function (shell, options) {
    var topicId = shell.getVar('recentTopic');
    shell.log("Your reply was posted to topic " + topicId + ".");
    shell.log('Your reply was: ' + options.content.replace(/\n/g, ""));
};