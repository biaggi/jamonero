var MemoryStream = require("memorystream");
var async = require("async");

var streamController = function(isTaskAsync, worker, nextTask) {
	this.stream = new MemoryStream();
	this.isTaskAsync = isTaskAsync;
	if (this.isTaskAsync) {
	//	TODO ASYNC IN CONFIGURATION
		this.queue = async.queue(worker, 5);
	}
	this.nextTask = nextTask;

	return this;
};

streamController.prototype.write = function(data) {
	this.stream.write(JSON.stringify(data));	
	if (this.isTaskAsync) {
		console.log('async currentTask');
		this.nextTask[data] = data;
		this.queue.push(
			this.nextTask
		);
	}
}

streamController.prototype.getStream = function() {
	return this.stream;
}

streamController.prototype.end = function(data) {
	this.stream.end(JSON.stringify(data));
}



decode = function(data) {
	stream.write(JSON.stringify(data));	
}

module.exports.streamController = streamController;
module.exports.decode = decode;
