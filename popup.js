function getActiveTab(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;
    console.assert(typeof url == 'string', 'tab.url should be a string');
    callback(tab);
  });
}

function getAllTabs(callback) {
  chrome.tabs.query({}, function(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      callback(tabs[i]);
    }
  });
}

function getContent(requestUrl, callback, errorCallback) {
  var x = new XMLHttpRequest();
  x.open('GET', requestUrl);
  //x.responseType = 'json';
  x.onload = function() {
    var response = x.response;
    if (!response || !response.responseData || !response.responseData.results ||
        response.responseData.results.length === 0) {
      errorCallback('No response from ' + requestUrl);
      return;
    }
    renderStatus(response);
  };
  x.onerror = function() {
    errorCallback('Network error.');
  };
  x.send();
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

var marketMakerBettingResponses = [];
var exchangeBettingResponse = [];

function processTabDomcument(bettingResponse) {
  if (bettingResponse.isBookMaker) {
    marketMakerBettingResponses.push(bettingResponse);
    updateMarketMakerOddsTable(bettingResponse);    
  } else {
    exchangeBettingResponse.push(bettingResponse);
    updateExchangeOddsTable(bettingResponse);
  }

  renderStatus("Updated");
}

function createMarketMakerOddsTableHeader(table) {
  var header = table.createTHead();
  var row = header.insertRow(0);

  var cell1 = document.createElement('th');
  var cell2 = document.createElement('th');
  var cell3 = document.createElement('th');
  var cell4 = document.createElement('th');
  var cell5 = document.createElement('th');
  var cell6 = document.createElement('th');
  cell1.innerHTML = "Website";
  cell2.innerHTML = "Time";
  cell3.innerHTML = "Name";
  cell4.innerHTML = "Home";
  cell5.innerHTML = "Draw";
  cell6.innerHTML = "Away";
  
  row.appendChild(cell1);
  row.appendChild(cell2);
  row.appendChild(cell3);
  row.appendChild(cell4);
  row.appendChild(cell5);
  row.appendChild(cell6);
  
  table.createTBody();
}

function createExchangeOddsTableHeader(table) {
  var header = table.createTHead();
  var row = header.insertRow(0);
  var cell1 = row.insertCell(-1);
  var cell2 = row.insertCell(-1);
  var cell3 = row.insertCell(-1);
  var cell4 = row.insertCell(-1);
  row.insertCell(-1);
  var cell5 = row.insertCell(-1);
  row.insertCell(-1);
  var cell6 = row.insertCell(-1);
  row.insertCell(-1);
  cell1.innerHTML = "Website";
  cell2.innerHTML = "Time";
  cell3.innerHTML = "Name";
  cell4.innerHTML = "Home";
  cell5.innerHTML = "Draw";
  cell6.innerHTML = "Away";
  
  table.createTBody();
}

function clearTable(table) {
  while(table.rows.length > 0) {
    table.deleteRow(0);
  }
}

function updateExchangeOddsTable(bettingResponse) {
  var table = document.getElementById("exchangeOddsTable").getElementsByTagName('tbody')[0];

  for (var i = 0; i < bettingResponse.betting.length; i++) {
    // Bet row
    var betRow = table.insertRow(-1); // Insert at the end.
    var betCell1 = betRow.insertCell(-1);
    var betCell2 = betRow.insertCell(-1);
    var betCell3 = betRow.insertCell(-1);
    var betCell4 = betRow.insertCell(-1);
    var betCell5 = betRow.insertCell(-1);
    var betCell6 = betRow.insertCell(-1);
    var betCell7 = betRow.insertCell(-1);
    var betCell8 = betRow.insertCell(-1);
    var betCell9 = betRow.insertCell(-1);
    betCell1.innerHTML = bettingResponse.website;
    betCell2.innerHTML = bettingResponse.betting[i].eventTime;
    betCell3.innerHTML = bettingResponse.betting[i].eventName;
    betCell4.innerHTML = bettingResponse.betting[i].home.bet.odd;
    betCell5.innerHTML = bettingResponse.betting[i].home.bet.quantity;
    betCell6.innerHTML = bettingResponse.betting[i].draw.bet.odd;
    betCell7.innerHTML = bettingResponse.betting[i].draw.bet.quantity;
    betCell8.innerHTML = bettingResponse.betting[i].away.bet.odd;
    betCell9.innerHTML = bettingResponse.betting[i].away.bet.quantity;
    
    // Lay row
    var layRow = table.insertRow(-1); // Insert at the end.
    var layCell1 = layRow.insertCell(-1);
    var layCell2 = layRow.insertCell(-1);
    var layCell3 = layRow.insertCell(-1);
    var layCell4 = layRow.insertCell(-1);
    var layCell5 = layRow.insertCell(-1);
    var layCell6 = layRow.insertCell(-1);
    var layCell7 = layRow.insertCell(-1);
    var layCell8 = layRow.insertCell(-1);
    var layCell9 = layRow.insertCell(-1);
    layCell1.innerHTML = bettingResponse.website;
    layCell2.innerHTML = bettingResponse.betting[i].eventTime;
    layCell3.innerHTML = bettingResponse.betting[i].eventName;
    layCell4.innerHTML = bettingResponse.betting[i].home.lay.odd;
    layCell5.innerHTML = bettingResponse.betting[i].home.lay.quantity;
    layCell6.innerHTML = bettingResponse.betting[i].draw.lay.odd;
    layCell7.innerHTML = bettingResponse.betting[i].draw.lay.quantity;
    layCell8.innerHTML = bettingResponse.betting[i].away.lay.odd;
    layCell9.innerHTML = bettingResponse.betting[i].away.lay.quantity;
  }
}

function updateMarketMakerOddsTable(bettingResponse) {
  var table = document.getElementById("marketMakerOddsTable").getElementsByTagName('tbody')[0];
  var i;
  for (i = 0; i < bettingResponse.betting.length; i++) {
    var row = table.insertRow(-1); // Insert at the end.
    var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);
    var cell4 = row.insertCell(-1);
    var cell5 = row.insertCell(-1);
    var cell6 = row.insertCell(-1);
    cell1.innerHTML = bettingResponse.website;
    cell2.innerHTML = bettingResponse.betting[i].eventTime;
    cell3.innerHTML = bettingResponse.betting[i].eventName;
    cell4.innerHTML = bettingResponse.betting[i].homeOdd;
    cell5.innerHTML = bettingResponse.betting[i].drawOdd;
    cell6.innerHTML = bettingResponse.betting[i].awayOdd;
  }
}

function getMarketMaker() {
  var e = document.getElementById("marketMaker");
  return e.options[e.selectedIndex].text;
}

function getBettingType() {
  var e = document.getElementById("bettingType");
  return e.options[e.selectedIndex].text;
}

function getStake() {
  
}

function clickHandler(e) {
  console.log("Start calcuation " + getMarketMaker() + getBettingType());
}

document.addEventListener('DOMContentLoaded', function() {
  var marketMakerOddsTable = document.getElementById("marketMakerOddsTable");
  clearTable(marketMakerOddsTable);
  createMarketMakerOddsTableHeader(marketMakerOddsTable);
  
  var exchangeOddsTable = document.getElementById("exchangeOddsTable");
  clearTable(exchangeOddsTable);
  createExchangeOddsTableHeader(exchangeOddsTable);
  
  document.getElementById('calculate').addEventListener('click', clickHandler);
  
  getAllTabs(function(tab) {
    chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, processTabDomcument);
  })
});
