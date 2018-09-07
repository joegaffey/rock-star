const express = require('express');
const app = express();
const kafka = require('kafka-node');

const assets = require("./assets");
app.use("/assets", assets);

app.use(express.static('public'));

const bodyParser = require('body-parser')
app.use(bodyParser.json());   

const client = new kafka.Client(process.env.zk, 'rockstar');
const producer = new kafka.Producer(client);

producer.on('ready', function () {
  console.log('Producer is ready');
});

producer.on('error', function (err) {
  console.log('Producer is in error state');
  console.log(err);
})

function sendMessage(topic, message) {
  let payloads = [
    { topic: topic, messages:message, partition: 0 }
  ];
  producer.send(payloads, function (err, data) {
    data;
  });
}

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/songs/latest", function (request, response) {
  sendMessage('game', JSON.stringify({id: 1}));
  response.sendFile(__dirname + '/s1.json');
});

app.get("/songs/:id", function (request, response) {
  sendMessage('song', JSON.stringify({id: request.params.id}));
  sendMessage('game', JSON.stringify({id:'tmp',action: 'start'}));
  songStats[request.params.id]++;
  response.sendFile(__dirname + '/s' +  request.params.id + '.json');
});

app.get("/songs", function (request, response) {
  response.sendFile(__dirname + '/songs.json');
});

let playerStats = new Array(4).fill(0);

app.put('/metrics/players', function(req, res) {
  let message = {'playerOneAccuracy':req.body[0],
                 'playerTwoAccuracy':req.body[1], 
                 'playerThreeAccuracy':req.body[2],
                 'playerFourAccuracy':req.body[3] };
  sendMessage('stats',JSON.stringify(message));
  req.body.forEach((stat, i) => {
    playerStats[i] = stat;
  });
  res.send(playerStats);
});

let songStats = new Array(8).fill(0);

app.get("/metrics", function (request, response) {
  response.write(playerStats.map((stat, i) => `player_${i}_accurracy ${stat}\n`).join(''));  
  response.write(songStats.map((stat, i) => `song_${i}_plays ${stat}\n`).join(''));  
  response.end();
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});