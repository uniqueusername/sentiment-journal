var express = require('express');
var app = express();
var fs = require('fs');
var path = require('path');
var server = require('http').createServer(app);
var sentiment = require('sentiment');
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function() {
  console.log('Server listening at port %d', port);

  let journals = { };

  // create journals file if it does not exist
  fs.open('journals.json', 'r', function(err, fd) {
    if (err) {
      fs.writeFileSync('journals.json', JSON.stringify(journals), function(err) {
        if (err) {
          console.log(err);
        }
        console.log('Created file `journals.json`.');
      });
    } else {
      console.log('`journals.json` was read.');
    }
  });
});

// routing
app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', function (socket) {

  socket.on('save journal', function(text, token) {
    journals = JSON.parse(fs.readFileSync('journals.json'));
    let today = new Date();

    analysis = sentiment(text);
    journals[token][today.toDateString()] = [text, analysis];
    fs.writeFileSync('journals.json', JSON.stringify(journals), 'utf8');

    socket.emit('journal saved');
  });

  socket.on('send login token', function(token, registering) {
    journals = JSON.parse(fs.readFileSync('journals.json'));

    // if the user is logging on for the first time
    if (registering) {
      if (journals[token] != null || journals[token] != undefined) {
        let newToken = Math.floor(Math.random()*1000000000);
        journals[newToken] = {};
        socket.emit('token taken', newToken);
        fs.writeFileSync('journals.json', JSON.stringify(journals), 'utf8');
      } else {
        journals[token] = {};
        fs.writeFileSync('journals.json', JSON.stringify(journals), 'utf8');
      }
    } else {
      let today = new Date();
      socket.emit('send journal', journals[token][today.toDateString()]);
    }
  });

  socket.on('request yesterday', function(token, clientDate) {
    journals = JSON.parse(fs.readFileSync('journals.json'));
    if (journals[token][clientDate] != undefined) {
      var journalText = journals[token][clientDate];
      socket.emit('send journal', journalText);
    } else {
      socket.emit('change date', 1);
    }
  });

  socket.on('request tomorrow', function(token, clientDate) {
    journals = JSON.parse(fs.readFileSync('journals.json'));
    if (journals[token][clientDate] != undefined) {
      var journalText = journals[token][clientDate];
      socket.emit('send journal', journalText);
    } else {
      socket.emit('change date', -1);
    }
  });

  socket.on('request stats', function(token) {
    journals = JSON.parse(fs.readFileSync('journals.json'));
    let statsOverTime = [];
    let datesOfStats = [];

    for (let i = 0; i < Object.keys(journals[token]).length; i++) {
      // create array of all data points;
      statsOverTime.push(journals[token][Object.keys(journals[token])[i]][1].score);
      datesOfStats.push(Object.keys(journals[token])[i]);
    }

    socket.emit('send stats', statsOverTime, datesOfStats)
  });

});
