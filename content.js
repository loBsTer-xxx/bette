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
      response.website = 'Smarkets';
      response.isBookMaker = false;
      response.commission = 0.02;

      if (url.search('coupon') >= 0) {
        getSmarketsCoupons(response);
      } else {
        getSmarketsBettings(response);
      }
    } else if (url.search('paddypower') >= 0) {
      getPaddyPowerBettings(response);
    } else if (url.search('ladbrokes') >= 0) {
      getLadBrokesBettings(response);
    }
    console.log(response);
    sendResponse(response);
  }
});

function getSmarketsCoupons(response) {
  var wrappers = document.querySelectorAll("tr[data-winners]");
  for (var i in wrappers) {
    if (wrappers[i].children === undefined) {
      continue;
    }
    var eventTitle = wrappers[i].children[0].textContent.trim();
    eventTitle = normalizeTeamName(eventTitle);
    var eventDate = null;
    var eventTime = null;
    var homeBet = buildSmarketsCouponOdds(wrappers[i].children[1]);
    var drawBet = buildSmarketsCouponOdds(wrappers[i].children[2]);
    var awayBet = buildSmarketsCouponOdds(wrappers[i].children[3]);
    response.betting.push(buildJsonResponse(response.website,
        response.isBookMaker, response.commission,
        eventDate, eventTime, eventTitle, homeBet, drawBet, awayBet));
  }
}

function buildSmarketsCouponOdds(quote) {
  var betOdd = getOnlyTextContent(quote, "offer");
  var betQty = null;
  var layOdd = getOnlyTextContent(quote, "bid");
  var layQty = null;
  return buildJsonOdd(betOdd, betQty, layOdd, layQty);
}

function getSmarketsBettings(response) {
  var wrappers = document.getElementsByClassName("market");
  var datetime = document.getElementById('masthead')
      .getElementsByTagName('h2')[0].childNodes[0].nodeValue
      .trim()
      .replace('\n', '').split(' · ');
  var eventDate = datetime[0];
  var eventTime = datetime[1];
  var homeTeam = document.getElementById("formatted_event_name")
      .getElementsByClassName('home')[0].textContent;
  var awayTeam = document.getElementById("formatted_event_name")
      .getElementsByClassName('away')[0].textContent;
  var eventTitle = homeTeam + ' vs. ' + awayTeam;
  eventTitle = normalizeTeamName(eventTitle);
  var bestBets = wrappers[0].getElementsByClassName("offer best");
  var bestLays = wrappers[0].getElementsByClassName("bid best");
  var homeBet = buildSmarketsOdds(bestBets[0], bestLays[0]);
  var drawBet = buildSmarketsOdds(bestBets[1], bestLays[1]);
  var awayBet = buildSmarketsOdds(bestBets[2], bestLays[2]);
  response.betting.push(buildJsonResponse(response.website,
      response.isBookMaker, response.commission,
      eventDate, eventTime, eventTitle, homeBet, drawBet, awayBet));
}

function buildSmarketsOdds(bestBet, bestLay) {
  var betOdd = getOnlyTextContent(bestBet, "price");
  var betQty = getOnlyTextContent(bestBet, "qty");
  var layOdd = getOnlyTextContent(bestLay, "price");
  var layQty = getOnlyTextContent(bestLay, "qty");
  return buildJsonOdd(betOdd, betQty, layOdd, layQty);
}

// Only works for "Competitions" page.
function getLadBrokesBettings(response) {
  response.website = 'LadBrokes';
  response.isBookMaker = true;
  response.commission = 0;
  var wrappers = document.getElementsByClassName("event-list");
  var i;
  for (i = 0; i < wrappers.length; i++) {
    var datetime = wrappers[i].getElementsByClassName('time')[0].innerHTML
        .split('<br>');
    if (datetime.length < 2) {
      return;
    }
    var eventDate = datetime[0];
    var eventTime = datetime[1];
    var eventTitle = getOnlyTextContent(wrappers[i], 'name')
        .replace(' v ', ' vs. ');
    eventTitle = normalizeTeamName(eventTitle);
    var odds = wrappers[i].getElementsByClassName("price");
    var homeOdd = buildJsonBackOdd(
        odds[0].textContent.trim(), null /* quantity */);
    var drawOdd = buildJsonBackOdd(
        odds[1].textContent.trim(), null /* quantity */);
    var awayOdd = buildJsonBackOdd(
        odds[2].textContent.trim(), null /* quantity */);
    response.betting.push(buildJsonResponse(response.website,
        response.isBookMaker, response.commission,
        eventDate, eventTime, eventTitle, homeOdd, drawOdd, awayOdd));
  }
}

function getPaddyPowerBettings(response) {
  response.website = 'PaddyPower';
  response.isBookMaker = true;
  response.commission = 0;
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
      var eventDate = '';
      var eventTime = getOnlyTextContent(events[j], "fb_event_time");
      if (eventTime == '') {
        continue;
      }
      var eventTitle = getOnlyTextContent(events[j], "fb_event_name")
          .replace(' v ', ' vs. ');
      var odds = events[j].getElementsByClassName("oddssmall");
      var homeOdd = buildJsonBackOdd(
          odds[0].textContent.trim(), null /* quantity */);
      var drawOdd = buildJsonBackOdd(
          odds[1].textContent.trim(), null /* quantity */);
      var awayOdd = buildJsonBackOdd(
          odds[2].textContent.trim(), null /* quantity */);
      response.betting.push(buildJsonResponse(response.website,
          response.isBookMaker, response.commission,
          eventDate, eventTime, eventTitle, homeOdd, drawOdd, awayOdd));
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

function normalizeTeamName(eventTitle) {
  return eventTitle
      .replace('West Ham United', 'West Ham')
      .replace('Stoke City', 'Stoke')
      .replace('Swansea City', 'Swansea')
      .replace('Manchester United', 'Manchester Utd')
      .replace('Swansea City', 'Swansea')
      .replace('Leicester City', 'Leicester')
      .replace('West Bromwich Albion', 'West Brom')
      .replace('AFC Bournemouth', 'Bournemouth')
      .replace('Tottenham Hotspur', 'Tottenham')
      .replace('Hull City', 'Hull');
}

function buildJsonResponse(website, isBookMaker, commission, eventDate,
    eventTime, eventName, homeBet, drawBet, awayBet) {
  return {
    website: website,
    isBookMaker: isBookMaker,
    eventDate : eventDate,
    eventTime : eventTime,
    eventName : eventName,
    home: homeBet,
    draw: drawBet,
    away: awayBet,
    commission: commission,
  };
}

function buildJsonBackOdd(backOdd, backQuantity) {
  return buildJsonOdd(
      backOdd, backQuantity, null /* layOdd */, null /* layQuantity */)
}

function buildJsonOdd(betOdd, betQuantity, layOdd, layQuantity) {
  return {
    bet: {
      odd: parseFloat(betOdd),
      quantity: betQuantity
    },
    lay: {
      odd: parseFloat(layOdd),
      quantity: layQuantity
    }
  }
}
