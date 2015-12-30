var path = require("path");

module.exports = {

	getConfFile: function(command) {
		return require(path.resolve(process.cwd(), command.replace(":", '/'), "conf"))
	},
	getRunner: function(command) {
		return require(path.resolve(process.cwd(), command.replace(":", '/'), "index"));
	}

}