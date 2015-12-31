var path = require("path");
var optional = require("optional");
var Stream = require("../lib/stream");

module.exports = {
	tasks: ['task1', 'task2', 'task3'],
	taskId: 0,
	getConfFile: function(command) {
		return optional(path.resolve(process.cwd(), command.path, command.task, "conf"))
	},
	getRunner: function(command) {
		return require(path.resolve(process.cwd(), command.path, command.task, "index"));
	},
	_getNextTask: function(command) {

		var key = null;
		for (key in this.tasks) {
			var value = this.tasks[key];

			if (command == value) {
				var nextKey = parseInt(key) + 1;
				if (this.tasks[nextKey]) {
					return this.tasks[nextKey];
				}
			}
		}

	},
	getTaskFromNS: function(command) {
		var task = /([^\/]*)\/?([^\/]+)\/?/;
		return {path: task.exec(command)[1], task: task.exec(command)[2]};
	},
	_getTaskFromMessage: function(command) {
		return {path: command.path, task: command.currentCommand.name};
	},
	composeTask: function(command, data) {

		return {
			currentCommand: {
				name: command.task, 
				config: this.getConfFile(command)
			},
			nextCommand: {
				name: this._getNextTask(command.task), 
				config: this.getConfFile({path: command.path, task: this._getNextTask(command.task)})
			},
			data: data,
			path: command.path
		}

	},
	_isTaskAsync: function(task) {
		return (task && 
	  		task.type && 
	  		task.type == 'async')
			== true;
	},
	runTask: function(commandInfo, cb) {
		console.log('executing command', commandInfo);

		//task name
		var currentCommand = commandInfo.currentCommand;
		var nextCommand = commandInfo.nextCommand;

		console.log('currentCommand, nextCommand', currentCommand, nextCommand)
		//task configuration
	  	var taskConfiguration = currentCommand.config;
	  	var nextTaskConfiguration = nextCommand.config;

	  	// task path information (dao here?)
		var currentTask = 	{
					path: commandInfo.path, 
					task: currentCommand.name
				};

console.log(currentCommand.name, commandInfo.path)

		var nextTask = 	{
					path: commandInfo.path,  
					task: thisObject._getNextTask(currentCommand.name)
				};

		var isTaskAsync = this._isTaskAsync(taskConfiguration); 
		var isNextTaskAsync = this._isTaskAsync(nextTaskConfiguration);

		var task = this.getRunner(currentTask);
		console.log('Info recovered currentCommand, nextCommand, taskConfiguration, nextTaskConfiguration, currentTask, nextTask', 
			currentCommand, nextCommand, taskConfiguration, nextTaskConfiguration, currentTask, nextTask);

		console.log('isTaskAsync, isNextTaskAsync', isTaskAsync, isNextTaskAsync);

		// stream creation
		var streamController = new Stream.streamController(
			isTaskAsync, this.runTask, this.composeTask(nextTask));
		var stream = streamController.getStream();

		stream.on('data', function(data) {
			console.log('stream on data -- next is async', isTaskAsync, isNextTaskAsync)
		});

		stream.on("end", function(data) {
			console.log('stream on end -- next is async', isTaskAsync, isNextTaskAsync)
			if (isNextTaskAsync) {
				console.log('async end', data);
			}

			if (isTaskAsync) {
				if (cb) cb();
			} else {
				if (cb) cb(data);				
			}
		});

		var taskInfo = [{
			parameters: taskConfiguration.parameters,
			stream: streamController,
			data: commandInfo.data
		}];

		console.log('running ', taskInfo);

		task.run.apply(task, taskInfo);

	}
}