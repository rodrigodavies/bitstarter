var express = require('express');

var app = express.createServer(express.logger());

var fs = require('fs');

// create buffer to read the file and convert to a string object
var buffer = new Buffer(fs.readFileSync('index.html'));
var text = buffer.toString();

app.get('/', function(request, response) {
  response.send(text);
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
