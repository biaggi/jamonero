
module.exports = {
	run: function(data) {
		console.log('in task3', data);
		var stream = data.stream;

		stream.write("write second task")

		stream.end("end second task");
	}
};