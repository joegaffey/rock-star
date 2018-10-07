const express = require('express');
const request = require('request');  
const assets = require("./assets");

const app = express();
app.use("/assets", assets);
app.use(express.static('public'));

const samplePath = process.env.samples || 'https://nbrosowsky.github.io/tonejs-instruments';

app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get("/samples*", function (req, res) {
  request(samplePath + req.path).pipe(res);
});

var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});