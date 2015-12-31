var MemoryStream = require("memorystream");
var async = require("async");

var streamController = function(isTaskAsync, worker, nextTask, workerObject) {
	this.stream = new MemoryStream();
	this.isTaskAsync = isTaskAsync;
	this.workerObject = workerObject;
	this.worker = worker;
	this.nextTask = nextTask;

	if (nextTask) {
		this.nextTask['workerObject'] = this.workerObject;

		if (this.isTaskAsync ) {
		//	TODO ASYNC IN CONFIGURATION
			this.queue = async.queue(worker, 5);
		}
	}

	return this;
};

streamController.prototype.write = function(data) {
	this.stream.write(JSON.stringify(data));	
	if (this.isTaskAsync && this.nextTask) {
		console.log('async currentTask');
		this.nextTask['data'] = data;
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
	if (!this.isTaskAsync && this.nextTask) {
		this.nextTask['data'] = data;
		console.log(this.worker)
		this.worker(this.nextTask);
	}
}



decode = function(data) {
	stream.write(JSON.stringify(data));	
}

module.exports.streamController = streamController;
module.exports.decode = decode;
