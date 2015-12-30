var program = require('commander');
var fs = require("fs");
var path = require("path");
var optional = require("optional");
var utils = require("./lib/utils.js")

program
  .version('0.0.1')
  .option('run [task]', 'Run the current pipeline')
  .option("create [type]", "Create a namespace to store tasks")


//considerate this
program.option.apply(program, ["test", "desc"]);

program.parse(process.argv);

  /*
   * Run a task in a given namespace
   */
  if (program.run) {
  	var command = program.run;
  	console.log(command)

  	var taskConfiguration = utils.getConfFile(command);
  	var task = utils.getRunner(command);

	console.log('task', task, taskConfiguration);

  	task.run.apply(task, taskConfiguration);

//  	task.run();
  }

  if (program.create) {
  	// create a folder given a namespace a:b:c will create a/b/c
  	// ask for git repo
  }