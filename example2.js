'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, setInterval: true, console: true, module: true */

var CoinMarketCap = require('.');

var options = {
	events: true,
	refresh: 10, // Refresh time in seconds (Default: 60)
	currency: 'USD' // get price in a different currency. (Default USD)
};
var coinmarketcap = new CoinMarketCap(options); 

// Put event for price above or equal than X
coinmarketcap.onPriceAbove('BTC', 4000, (coin, event) => {
	console.log('BTC price is above than 4000 of your defined currency');
	event.price = event.price + 100; // Increase the price that the event needs to be fired.
});

coinmarketcap.onPriceBelow('BTC', 50000, (coin, event) => {
	console.log('BTC price is below than 50000 of your defined currency');
	event.price = event.price - 100; // Decrease the price that the event needs to be fired.
});

// Put event for percent change. You can define negative and positive percent changes.
coinmarketcap.onPricePercentChange7d('ETH', 15, (coin, event) => {
	console.log('BTC has a percent change above 15% in the last 7 days');
	event.percent = event.percent + 5; // Increase the percentile change that the event needs to be fired.
});

coinmarketcap.onPricePercentChange24h('ETH', -10, (coin, event) => {
	console.log('BTC has a percent change beyond -10% in the last 24h');
	event.percent = event.percent - 5; // Decrease the percentile change that the event needs to be fired.
});

coinmarketcap.onPricePercentChange1h('LTC', 10, (coin, event) => {
	console.log(coin);
	coinmarketcap.deleteEvent(event); // Deletes the event
});

// Put event on BTC with no conditions. It will trigger every 60 seconds (*) with information about that coin (*: Or the defined time in options)
coinmarketcap.onUpdate((coin, event) => {
	console.log(coin.getTicker('BTC'));
	coinmarketcap.deleteEvent(event); // Deletes the event
});

