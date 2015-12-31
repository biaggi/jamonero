var fs = require("fs");

module.exports = {
	run: function(data) {
		console.log('in task1', data);
		var auth = data.parameters[0];
		var projects = data.parameters[1];
		var file = data.parameters[2];
		var stream = data.stream;

		/*
		var exec = require('child_process').exec;
		projects.forEach(function(project) {
			exec("node node_modules/stash2repoconfig/stash2repoconfig.js "
				 + auth + " --project " + project + " --repo " + file, function(error, stdout, stderror) {
				console.log(error, stdout, stderror);

			})
		});
*/	
		console.log('file', file)
		var content = JSON.parse(fs.readFileSync(file, 'utf-8'));
//		console.log('content', content);
		content.forEach(function(data) {
			if (data.dir == '') {
				return;
			}
			console.log('write', data)
			stream.write(data)
			console.log('post-write')
		})
					console.log('end')

		stream.end(content);
					console.log('post-end')
		//dir, url, repos
	}
};