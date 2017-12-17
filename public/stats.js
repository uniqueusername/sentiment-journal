var socket = io();

var months = {"jan": "01", "feb": "02", "mar": "03", "apr": "04", "may": "05", "jun": "06", "jul": "07", "aug": "08", "sep": "09", "oct": "10", "nov": "11", "dec": "12"};

function requestStats() {
  socket.emit('request stats', localStorage.getItem("loginToken"));
}

socket.on('send stats', function(stats, dates) {
  var container = document.getElementById('visualization');
  var items = [];

  var firstDate;
  var lastDate;

  for (let i = 0; i < stats.length; i++) {
    let splitDate = dates[i].split(" ");
    let currentDate = `${splitDate[3]}-${months[splitDate[1].toLowerCase()]}-${splitDate[2]}`;
    items.push({ x: currentDate, y: stats[i] });
    if (i == 0) {
      firstDate = currentDate;
    } else if (i == stats.length - 1) {
      lastDate = currentDate;
    }
  }

  console.log(items);

  var dataset = new vis.DataSet(items);
  var options = {
    start: firstDate,
    end: lastDate
  };
  var Graph2d = new vis.Graph2d(container, dataset, options);
});
