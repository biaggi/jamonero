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
  	var taskInfo = utils.composeTask(utils.getTaskFromNS(command));

  	utils.runTask(taskInfo);

  }

  if (program.create) {
  	// create a folder given a namespace a:b:c will create a/b/c
  	// ask for git repo
  }