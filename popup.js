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

var marketMakerBettings = [];
var exchangeBettingByEventName = {};
var profitByEventName = {};

function processTabDomcument(bettingResponse) {
  if (bettingResponse === undefined) {
    return;
  }

  console.log(bettingResponse);

  if (bettingResponse.isBookMaker) {
    for (var i in bettingResponse.betting) {
      marketMakerBettings.push(bettingResponse.betting[i]);
    }
    updateMarketMakerOddsTable(marketMakerBettings);
  } else {
    for (var i in bettingResponse.betting) {
      var betting = bettingResponse.betting[i];
      exchangeBettingByEventName[betting.eventName] = betting;
    }
    updateExchangeOddsTable(exchangeBettingByEventName);
    updateMarketMakerOddsTable(marketMakerBettings); // Refresh the bookie odds.
  }

  calculateAllProfits();

  console.log(marketMakerBettings);
  console.log(exchangeBettingByEventName);

  renderStatus("Updated");
}

function clearTable(table) {
  while(table.rows.length > 1) {
    table.deleteRow(1);
  }
}

function updateExchangeOddsTable(bettings) {
  var exchangeOddsTable = document.getElementById("exchangeOddsTable");
  clearTable(exchangeOddsTable);
  var table = exchangeOddsTable.getElementsByTagName('tbody')[0];

  for (var i in bettings) {
    var betting = bettings[i];
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
    var betCell10 = betRow.insertCell(-1);
    betCell1.innerHTML = betting.website;
    betCell2.innerHTML = betting.eventTime;
    betCell3.innerHTML = betting.eventName;
    betCell4.innerHTML = 'Back';
    betCell5.innerHTML = betting.home.bet.odd.toFixed(2);
    betCell6.innerHTML = betting.home.bet.quantity;
    betCell7.innerHTML = betting.draw.bet.odd.toFixed(2);
    betCell8.innerHTML = betting.draw.bet.quantity;
    betCell9.innerHTML = betting.away.bet.odd.toFixed(2);
    betCell10.innerHTML = betting.away.bet.quantity;
    
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
    var layCell10 = layRow.insertCell(-1);
    layCell1.innerHTML = betting.website;
    layCell2.innerHTML = betting.eventTime;
    layCell3.innerHTML = betting.eventName;
    layCell4.innerHTML = 'Lay';
    layCell5.innerHTML = betting.home.lay.odd.toFixed(2);
    layCell6.innerHTML = betting.home.lay.quantity;
    layCell7.innerHTML = betting.draw.lay.odd.toFixed(2);
    layCell8.innerHTML = betting.draw.lay.quantity;
    layCell9.innerHTML = betting.away.lay.odd.toFixed(2);
    layCell10.innerHTML = betting.away.lay.quantity;
  }
}

function updateMarketMakerOddsTable(bettings) {
  var marketMakerOddsTable = document.getElementById("marketMakerOddsTable");
  clearTable(marketMakerOddsTable);
  var table = marketMakerOddsTable.getElementsByTagName('tbody')[0];

  for (var i in bettings) {
    var betting = bettings[i];
    var row = table.insertRow(-1); // Insert at the end.

    //var cell1 = row.insertCell(-1);
    var cell2 = row.insertCell(-1);
    var cell3 = row.insertCell(-1);
    var cell4 = row.insertCell(-1);
    var cell5 = row.insertCell(-1);
    var cell6 = row.insertCell(-1);
    var cell7 = row.insertCell(-1);
    var cell8 = row.insertCell(-1);
    var cell9 = row.insertCell(-1);
    var cell10 = row.insertCell(-1);
    var cell11 = row.insertCell(-1);
    var cell12 = row.insertCell(-1);
    var cell13 = row.insertCell(-1);

    //cell1.innerHTML = betting.website;
    cell2.innerHTML = betting.eventDate;
    cell3.innerHTML = betting.eventTime;
    cell4.innerHTML = betting.eventName;
    cell5.innerHTML = betting.home.bet.odd.toFixed(2);
    cell8.innerHTML = betting.draw.bet.odd.toFixed(2);
    cell11.innerHTML = betting.away.bet.odd.toFixed(2);
    
    var exchangeBetting = exchangeBettingByEventName[betting.eventName];
    if (exchangeBetting != undefined) {
      cell6.innerHTML = exchangeBetting.home.lay.odd.toFixed(2);
      cell9.innerHTML = exchangeBetting.draw.lay.odd.toFixed(2);
      cell12.innerHTML = exchangeBetting.away.lay.odd.toFixed(2);
    }

    var profit = profitByEventName[betting.eventName];
    if (profit != undefined) {
      cell7.innerHTML = profit.home.totalProfit.toFixed(2);
      cell10.innerHTML = profit.draw.totalProfit.toFixed(2);
      cell13.innerHTML = profit.away.totalProfit.toFixed(2);
    }
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
  return parseFloat(document.getElementById("stake").value);
}

function calculate(calculateProfitCallback) {
  var stake = getStake();
  if (isNaN(stake)) {
    return;
  }

  for (var i in marketMakerBettings) {
    var betting = marketMakerBettings[i];
    var exchangeBetting = exchangeBettingByEventName[betting.eventName];
    if (exchangeBetting === undefined) {
      continue;
    }

    var layCommission = exchangeBetting.commission;
    var homeProfit = calculateProfitCallback(
        stake, betting.home.bet.odd, exchangeBetting.home.lay.odd, layCommission);
    var drawProfit = calculateProfitCallback(
        stake, betting.draw.bet.odd, exchangeBetting.draw.lay.odd, layCommission);
    var awayProfit = calculateProfitCallback(
        stake, betting.away.bet.odd, exchangeBetting.away.lay.odd, layCommission);

    profitByEventName[betting.eventName] = buildJsonProfits(
        homeProfit, drawProfit, awayProfit);
  }
}

function calculateQualifyingBetProfit(
    backStake, backOdd, layOdd, layCommission) {
  if (isNaN(backOdd) || isNaN(layOdd)) {
    return;
  }
  var layStake = backStake * backOdd / (layOdd - layCommission);
  var totalProfit = backStake * (backOdd - 1) - layStake * (layOdd - 1);
  return {
    backStake: backStake,
    backOdd: backOdd,
    layStake: layStake,
    layOdd: layOdd,
    layCommission: layCommission,
    totalProfit: totalProfit,
  };
}

function calculateFreeBetProfit(
    backStake, backOdd, layOdd, layCommission) {
  if (isNaN(backOdd) || isNaN(layOdd)) {
    return;
  }
  var layStake = backStake * (backOdd - 1) / (layOdd - layCommission);
  var totalProfit = backStake * (backOdd - 1) - layStake * (layOdd - 1);
  return {
    backStake: backStake,
    backOdd: backOdd,
    layStake: layStake,
    layOdd: layOdd,
    layCommission: layCommission,
    totalProfit: totalProfit,
  };
}

function calculateRiskFreeBetProfit(
    backStake, backOdd, layOdd, layCommission) {
  if (isNaN(backOdd) || isNaN(layOdd)) {
    return;
  }
  var cashback = backStake; // Use the back stake as cashback amount by default.
  var layStake = (backStake * backOdd - cashback) / (layOdd - layCommission);
  var totalProfit = backStake * (backOdd - 1) - layStake * (layOdd - 1);
  return {
    backStake: backStake,
    backOdd: backOdd,
    layStake: layStake,
    layOdd: layOdd,
    layCommission: layCommission,
    totalProfit: totalProfit,
  };
}

function buildJsonProfits(homeProfit, drawProfit, awayProfit) {
  return {
    home: homeProfit,
    draw: drawProfit,
    away: awayProfit,
  }
}

function stakeInputHandler(e) {
  calculateAllProfits();
}

function calculateAllProfits() {
  var bettingType = getBettingType();
  console.log("Start calcuation " + getMarketMaker() + " " + bettingType);

  profitByEventName = {};

  if (bettingType == 'QualifyingBet') {
    calculate(calculateQualifyingBetProfit);
  } else if (bettingType == 'FreeBet') {
    calculate(calculateFreeBetProfit);
  } else if (bettingType == 'RiskFreeBet') {
    calculate(calculateRiskFreeBetProfit);
  }

  console.log(profitByEventName);
  updateMarketMakerOddsTable(marketMakerBettings);
}

function getDataFromAllTabs() {
  getAllTabs(function(tab) {
    chrome.tabs.sendMessage(tab.id, {text: 'report_back'}, processTabDomcument);
  })

  renderStatus(new Date().toUTCString());

  // Call the method every second.
  setTimeout(getDataFromAllTabs, 1000);
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('stake').addEventListener('input', stakeInputHandler)
  document.getElementById('bettingType').addEventListener('input', stakeInputHandler)
  
  getDataFromAllTabs();
});
