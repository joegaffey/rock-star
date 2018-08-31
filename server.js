// init project
var express = require('express');
var app = express();

var assets = require("./assets");
app.use("/assets", assets);

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/songs/latest", function (request, response) {
  response.sendFile(__dirname + '/s1.json');
});

app.get("/songs/:id", function (request, response) {
  response.sendFile(__dirname + '/s' +  request.params.id + '.json');
});

app.get("/songs", function (request, response) {
  response.sendFile(__dirname + '/songs.json');
});

app.get("/metrics", function (request, response) {
  response.send('metric1 666');
});

// listen for requests
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});