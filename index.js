var program = require('commander');
var fs = require("fs");
var path = require("path");
var utils = require("./lib/utils.js")

program
  .version('0.0.1')
  .option('run [task]', 'Run the current pipeline')
  .option("create [type]", "Create a namespace to store tasks")


// take this into consideration to introduce parameters dinamically 
program.option.apply(program, ["test", "desc"]);

program.parse(process.argv);

  /*
   * Run a task in a given namespace
   */
  if (program.run) {

  	var command = program.run;
  	console.log('task from ns', utils.getTaskFromNS(command))
  	var taskInfo = utils.composeTask(utils.getTaskFromNS(command));
	
	console.log('running first task', taskInfo)
  	utils.runTask(taskInfo);

  }

  if (program.create) {
  	// create a folder given a namespace a:b:c will create a/b/c
  	// ask for git repo
  }