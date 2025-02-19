'use strict';
const { createRequire } = require('node:module');
require = createRequire(__filename);
var express = require('express');

const port_num = parseInt(process.argv[2] || '8080');

var app = express();
// var Server = require('http').Server;
// var server = new Server(app);

// server.listen(port_num);

app.use(function (req, res, next) {
  console.log(`${req.url}`);
  next();
});

// __dirname is used here along with package.json.pkg.assets
// see https://github.com/zeit/pkg#config and
// https://github.com/zeit/pkg#snapshot-filesystem
app.use('/', express.static(__dirname + '/views'));

app.get('/hello', function (req, res) {
  res.send('hello world');
});

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.listen(port_num, (e) => {
  if (e) {
    console.error(
      `Express Server running at http://localhost:${port_num} error:${e}`,
    );
    return;
  }
  console.log(`Express Server running at http://localhost:${port_num}`);
});
