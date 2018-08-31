const express = require('express');
const app = express();

const assets = require("./assets");
app.use("/assets", assets);

app.use(express.static('public'));

var bodyParser = require('body-parser')
app.use(bodyParser.json());   

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/songs/latest", function (request, response) {
  response.sendFile(__dirname + '/s1.json');
});

app.get("/songs/:id", function (request, response) {
  songStats[request.params.id]++;
  response.sendFile(__dirname + '/s' +  request.params.id + '.json');
});

app.get("/songs", function (request, response) {
  response.sendFile(__dirname + '/songs.json');
});

let playerStats = new Array(4).fill(0);

app.put('/metrics/players', function(req, res) {
  req.body.forEach((stat, i) => {
    playerStats[i] = stat;
  });
  res.send(playerStats);
});

let songStats = new Array(8).fill(0);

app.get("/metrics", function (request, response) {
  response.write('metric1 666\n');
  response.write(playerStats.map((stat, i) => `player_${i}_accurracy ${stat}\n`).join(''));  
  response.write(songStats.map((stat, i) => `song_${i}_plays ${stat}\n`).join(''));  
  response.end();
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});