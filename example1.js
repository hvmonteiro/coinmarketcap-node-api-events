'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, setInterval: true, console: true, module: true */

var CoinMarketCap = require('.');
var coinmarketcap = new CoinMarketCap();
// If you want to check a single coin, use get() (You need to supply the coinmarketcap id of the cryptocurrency, not the symbol)
// If you want to use symbols instead of id, use multi.
coinmarketcap.getTicker('bitcoin', coin => {
  console.log(coin.price_usd); // Prints the price in USD of BTC at the moment.
});
// If you want to check multiple coins, use multi():
coinmarketcap.getAllTickers(coins => {
  console.log(coins.get('BTC').price_usd); // Prints price of BTC in USD
  console.log(coins.get('ETH').price_usd); // Print price of ETH in USD
  console.log(coins.get('ETH').price_btc); // Print price of ETH in BTC
  console.log(coins.getTop(10)); // Prints information about top 10 cryptocurrencies
});

// Get Global Market Data
coinmarketcap.getGlobalData( (globalData) => {
    console.log(globalData);
});
