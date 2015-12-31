var path = require("path");
var optional = require("optional");
var Stream = require("../lib/stream");

module.exports = {
	tasks: ['task1', 'task2', 'task3'],
	taskId: 0,
	getConfFile: function(command) {
		console.log(command)
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
		
		console.log('compose ', command, data, this._getNextTask(command.task));

		var composed = {
			currentCommand: {
				name: command.task, 
				config: this.getConfFile(command)
			},
			nextCommand:
				this._getNextTask(command.task) == null
					? null 
					:
					{
						name: this._getNextTask(command.task), 
						config: this.getConfFile({path: command.path, task: this._getNextTask(command.task)})
					},
			data: data,
			path: command.path
		}

		console.log('composed', composed)
		return composed;

	},
	_isTaskAsync: function(task) {
		return (task && 
	  		task.type && 
	  		task.type == 'async')
			== true;
	},
	runTask: function(commandInfo, cb) {

		console.log('executing command', commandInfo);
		if (commandInfo == 'undefined' 
			|| commandInfo == undefined || commandInfo == null || !commandInfo) {
				console.log('exiting due to undefined commandInfo')
			if (cb) {
				return cb();
			} else {
				return;
			}
		}

		if (('workerObject' in commandInfo) && commandInfo.workerObject != null) {
			thisObject = commandInfo.workerObject;
		} else {
			thisObject = this;
		}

		//task name
		var currentCommand = commandInfo.currentCommand;
		var nextCommand = commandInfo.nextCommand;

		console.log('currentCommand, nextCommand', currentCommand, nextCommand)
		//task configuration
	  	var taskConfiguration = currentCommand.config;
	  	var nextTaskConfiguration = nextCommand ? nextCommand.config : null;

	  	// task path information (dao here?)
		var currentTask = 	{
					path: commandInfo.path, 
					task: currentCommand.name
				};

		console.log(currentCommand.name, commandInfo.path)
		// TODO this object have been lost
		var nextTask = 	{
					path: commandInfo.path,  
					task: thisObject._getNextTask(currentCommand.name)
				};

		var isTaskAsync = thisObject._isTaskAsync(taskConfiguration); 
		var isNextTaskAsync = thisObject._isTaskAsync(nextTaskConfiguration);

		var task = thisObject.getRunner(currentTask);

		console.log('isTaskAsync, isNextTaskAsync', isTaskAsync, isNextTaskAsync);

		// stream creation
		// TODO Esto es una chapuza, aqui no se deberían estar pasando tantas cosas
console.log('next task', nextTask.task)
		var streamController = new Stream.streamController(
			isTaskAsync, 
			thisObject.runTask, 
			nextTask.task ? thisObject.composeTask(nextTask) : null, 
			thisObject);

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

		console.log(taskConfiguration)
		var taskInfo = [{
			parameters: taskConfiguration && taskConfiguration.parameters ? taskConfiguration.parameters : null,
			stream: streamController,
			data: commandInfo.data
		}];

		console.log('running ', taskInfo);

		task.run.apply(task, taskInfo);

	}
}