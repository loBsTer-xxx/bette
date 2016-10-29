// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.text === 'report_back') {
    var response = {
      website: '',
      isBookMaker: false,
      betting: [],
    };
    var url = window.location.href;
    if (url.search('smarkets') >= 0) {
      getSmarketsBettings(response);
    } else if (url.search('paddypower') >= 0) {
      getPaddyPowerBettings(response);
    } else if (url.search('ladbrokes') >= 0) {
      getLadBrokesBettings(response);
    }
    console.log(response);
    sendResponse(response);
  }
});

function getSmarketsBettings(response) {
  response.website = 'Smarkets';
  response.isBookMaker = false;
  var wrappers = document.getElementsByClassName("market");
  var datetime = document.getElementsByClassName("timeago")[0].title.split(' - ');
  var eventTime = datetime[1];
  var eventTitle = document.getElementById("formatted_event_name").textContent.trim();
  var bestBets = wrappers[0].getElementsByClassName("offer best");
  var bestLays = wrappers[0].getElementsByClassName("bid best");
  var homeBetOdd = getOnlyTextContent(bestBets[0], "price");
  var homeBetQty = getOnlyTextContent(bestBets[0], "qty");
  var drawBetOdd = getOnlyTextContent(bestBets[1], "price");
  var homeBetQty = getOnlyTextContent(bestBets[1], "qty");
  var awayBetOdd = getOnlyTextContent(bestBets[2], "price");
  var homeBetQty = getOnlyTextContent(bestBets[2], "qty");
  var homeBet = buildSmarketsOdds(bestBets[0], bestLays[0]);
  var drawBet = buildSmarketsOdds(bestBets[1], bestLays[1]);
  var awayBet = buildSmarketsOdds(bestBets[2], bestLays[2]);
  response.betting.push(buildJsonResponse(eventTime, eventTitle, homeBetOdd, drawBetOdd, awayBetOdd, homeBet, drawBet, awayBet));
}

function buildSmarketsOdds(bestBet, bestLay) {
  var betOdd = getOnlyTextContent(bestBet, "price");
  var betQty = getOnlyTextContent(bestBet, "qty");
  var layOdd = getOnlyTextContent(bestLay, "price");
  var layQty = getOnlyTextContent(bestLay, "qty");
  return buildJsonOdd(betOdd, betQty, layOdd, layQty);
}

// Only works for "Competitions" button.
function getLadBrokesBettings(response) {
  response.website = 'LadBrokes';
  response.isBookMaker = true;
  var wrappers = document.getElementsByClassName("event-list");
  var i;
  for (i = 0; i < wrappers.length; i++) {
    var datetime = wrappers[i].getElementsByClassName('time')[0].innerHTML.split('<br>');
    if (datetime.length < 2) {
      return;
    }
    var eventDate = datetime[0];
    var eventTime = datetime[1];
    var eventTitle = getOnlyTextContent(wrappers[i], 'name').replace(' v ', ' vs. ');
    var odds = wrappers[i].getElementsByClassName("price");
    var homeOdd = odds[0].textContent.trim();
    var drawOdd = odds[1].textContent.trim();
    var awayOdd = odds[2].textContent.trim();
    response.betting.push(buildJsonResponse(eventTime, eventTitle, homeOdd, drawOdd, awayOdd));
  }
}

function getPaddyPowerBettings(response) {
  response.website = 'PaddyPower';
  response.isBookMaker = true;
  // Add live matches.
  var wrappers = document.getElementsByClassName("fb_day_type_wrapper");
  var i;
  for (i = 0; i < wrappers.length; i++) {
    if (wrappers[i].id == '') {
      continue;
    }
    var events = wrappers[i].getElementsByClassName("pp_fb_event");
    var j;
    for (j = 0; j < events.length; j++) {
      var eventTime = getOnlyTextContent(events[j], "fb_event_time");
      if (eventTime == '') {
        continue;
      }
      var eventTitle = getOnlyTextContent(events[j], "fb_event_name").replace(' v ', ' vs. ');
      var odds = events[j].getElementsByClassName("oddssmall");
      var homeOdd = odds[0].textContent.trim();
      var drawOdd = odds[1].textContent.trim();
      var awayOdd = odds[2].textContent.trim();
      response.betting.push(buildJsonResponse(eventTime, eventTitle, homeOdd, drawOdd, awayOdd));
    }
  }
}

function getOnlyTextContent(elem, style) {
  var contents = elem.getElementsByClassName(style);
  if (contents.length > 0) {
    return contents[0].textContent.trim() 
  } else {
    return '';
  }
}

function getOnlyOdd(elem, style) {
  return getOnlyTextContent(elem, style);
}

function buildJsonResponse(eventTime, eventName, homeOdd, drawOdd, awayOdd, homeBet, drawBet, awayBet) {
  return {
    eventTime : eventTime,
    eventName : eventName,
    homeOdd : homeOdd,
    drawOdd : drawOdd,
    awayOdd : awayOdd,
    home: homeBet,
    draw: drawBet,
    away: awayBet,
  };
}

function buildJsonOdd(betOdd, betQuantity, layOdd, layQuantity) {
  return {
    bet: {
      odd: betOdd,
      quantity: betQuantity
    },
    lay: {
      odd: layOdd,
      quantity: layQuantity
    }
  }
}
