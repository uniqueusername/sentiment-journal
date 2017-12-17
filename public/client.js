// initialize
var socket = io();

var myToken;
var currentDate;

function login() {
  if (localStorage.getItem("loginToken") != undefined) {
    // 1. login token 2. registering
    socket.emit('send login token', localStorage.getItem("loginToken"), false);
    myToken = localStorage.getItem("loginToken");
  } else {
    localStorage.setItem("loginToken", Math.floor(Math.random()*1000000000));
    socket.emit('send login token', localStorage.getItem("loginToken"), true);
    myToken = localStorage.getItem("loginToken");
  }

  let header = document.getElementById("journal-header");
  let journalText = document.getElementById("journal-area").value;
  currentDate = new Date();
  header.innerHTML = `Journal [${currentDate.toDateString()}]`;
}

function submitJournal() {
  let today = new Date();
  if (currentDate.toDateString() == today.toDateString()) {
    var journalText = document.getElementById("journal-area").value;

    socket.emit('save journal', journalText, myToken);
  } else {
    alert("You cannot change past entries.");
  }
}

function previousJournal() {
  let header = document.getElementById("journal-header");

  currentDate.setDate(currentDate.getDate() - 1);
  socket.emit('request yesterday', myToken, currentDate.toDateString());
  header.innerHTML = `Journal [${currentDate.toDateString()}]`;
}

function nextJournal() {
  let header = document.getElementById("journal-header");

  currentDate.setDate(currentDate.getDate() + 1);
  socket.emit('request tomorrow', myToken, currentDate.toDateString());
  header.innerHTML = `Journal [${currentDate.toDateString()}]`;
}

socket.on('journal saved', function() {
  alert("Journal saved!");
});

socket.on('token taken', function(newToken) {
  localStorage.setItem("loginToken", newToken);
});

socket.on('send journal', function(journalText) {
  document.getElementById("journal-area").value = journalText[0];
  document.getElementById("score").innerHTML = "Sentiment Score: " + JSON.stringify(journalText[1].score);
  document.getElementById("positive-words").innerHTML = "Positive Words: " + JSON.stringify(journalText[1].positive);
  document.getElementById("negative-words").innerHTML = "Negative Words: " + JSON.stringify(journalText[1].negative);
});

socket.on('change date', function(increment) {
  let header = document.getElementById("journal-header");
  currentDate.setDate(currentDate.getDate() + increment);
  header.innerHTML = `Journal [${currentDate.toDateString()}]`;
});
