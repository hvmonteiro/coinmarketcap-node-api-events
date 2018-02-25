'use strict'; // jshint ignore:line

// jshint esversion: 6
/* globals require: true, __dirname: true, setInterval: true, console: true, module: true */

var request = require('request');

class CoinMarketCap {

    constructor(options = {} )  {
        this.API_URL = options.API_URL || 'https://api.coinmarketcap.com/v1';
        this.currency = options.currency || 'USD';
        this.currency = this.currency.toLowerCase();
        this.events = options.events || false;
        if (this.events) {
            this.refresh = options.refresh*1000 || 60*1000;
            this.events = [];
            this._emitter();
            setInterval(this._emitter.bind(this), this.refresh);
        }
    }

    _getJSON(url, callback) {
        request(this.API_URL+url, (error, response, body) => {
            if (error) {
                callback(false);
                return this;
            }
            if (response && response.statusCode == 200) {
                var data;
                try {
                    data = JSON.parse(body);
                } catch (err) {
                    // Don't crash on unexpected JSON
                    data = false;
                }
                callback(data);
            } else {
                callback(false);
                return this;
            }
        } ) ;
    }

    _find(symbols, symbol) {
        return symbols.find(o => o.symbol === symbol.toUpperCase()) ||
            symbols.find(o => o.id === symbol.toLowerCase());
    }

    _emitter() {
        this._getJSON(`/ticker/?convert=${this.currency}&limit=0`, (symbols) => {
            if (!symbols) { return false; }

            this.events.filter(e => e.type == 'update').forEach(event => {
                if (symbols) {

                    var res = {};
                    res.data = symbols;

                    res.getTicker = function(symbol) { return symbols.find(o => o.symbol === symbol.toUpperCase()) || symbols.find(o => o.id === symbol.toLowerCase()); };
                    res.getTopSymbols = function(limit) {return symbols.slice(0, limit);};
                    res.getAllTickers = function() { return symbols; };

                    event.callback(res, event);
                }
            } ) ;

            this.events.filter(e => e.type == 'tickerUpdate').forEach(event => {
                var res = this._find(symbols, event.symbol);
                if (res) {
                    event.callback(res, event);
                }
            } ) ;

            this.events.filter(e => e.type == 'priceAbove').forEach(event => {
                var res = this._find(symbols, event.symbol);
                if (res) {
                    if (res['price_'+this.currency] >= event.price) {
                        event.callback(res, event);
                    }
                }
            } ) ;

            this.events.filter(e => e.type == 'priceBelow').forEach(event => {
                var res = this._find(symbols, event.symbol);
                if (res) {
                    if (res['price_'+this.currency] <= event.price) {
                        event.callback(res, event);
                    }
                }
            } ) ;

            this.events.filter(e => e.type == 'pricePercentChange1h').forEach(event => {
                var res = this._find(symbols, event.symbol);
                if (res) {
                    if (event.percent < 0 && res.percent_change_1h <= event.percent ) {
                        event.callback(res, event);
                    } else if (event.percent > 0 && res.percent_change_1h >= event.percent) {
                        event.callback(res, event);
                    } else if (event.percent == 0 && res.percent_change_1h == 0) {
                        event.callback(res, event);
                    }
                }
            } ) ;

            this.events.filter(e => e.type == 'pricePercentChange24h').forEach(event => {
                var res = this._find(symbols, event.symbol);
                if (res) {
                    if (event.percent < 0 && res.percent_change_24h <= event.percent ) {
                        event.callback(res, event);
                    } else if (event.percent > 0 && res.percent_change_24h >= event.percent) {
                        event.callback(res, event);
                    } else if (event.percent == 0 && res.percent_change_24h == 0) {
                        event.callback(res, event);
                    }
                }
            } ) ;

            this.events.filter(e => e.type == 'pricePercentChange7d').forEach(event => {
                var res = this._find(symbols, event.symbol);
                if (res) {
                    if (event.percent < 0 && res.percent_change_7d <= event.percent ) {
                        event.callback(res, event);
                    } else if (event.percent > 0 && res.percent_change_7d >= event.percent) {
                        event.callback(res, event);
                    } else if (event.percent == 0 && res.percent_change_7d == 0) {
                        event.callback(res, event);
                    }
                }
            } ) ;
        } ) ;
    }

    getAllTickers(callback) {
        this._getJSON(`/ticker/?convert=${this.currency}&limit=0`, (symbols) => {
            if (symbols && callback) {
                var response = {};
                response.data = symbols;
                response.get = function(symbol) { return this.data.find(o => o.symbol === symbol.toUpperCase()) || this.data.find(o => o.id === symbol.toLowerCase()); };
                response.getTop = function(top) {return this.data.slice(0, top);};
                response.getAll = function() { return this.data; };
                callback(response);
            }
        } ) ;
        return this;
    }

    getGlobalData(callback) {
        if (callback) {
            this._getJSON(`/global/?convert=${this.currency}`, (res) => {
                if (res) {callback(res);}
            } ) ;
            return this;
        } else {
            return false;
        }
    }

    getTicker(symbol, callback) {
        if (callback) {
            this._getJSON(`/ticker/${symbol}/?convert=${this.currency}`, (res) => {
                if (res) {callback(res[0]);}
            } ) ;
            return this;
        } else {
            return false;
        }
    }

    getAllSymbols(callback) {
        if (callback) {
            this._getJSON(`/ticker/?convert=${this.currency}&limit=0`, callback);
            return this;
        } else {
            return false;
        }
    }

    getTopSymbols(limit, callback) {
        if (callback) {
            this._getJSON(`/ticker/?convert=${this.currency}&limit=${limit}`, callback);
            return this;
        } else {
            return false;
        }
    }

    getSymbolsPage(page, callback) {
        if (callback) {
            let start = (page - 1) * 100;
            this._getJSON(`/ticker/?convert=${this.currency}&start=${start}&limit=100`, callback);
            return this;
        } else {
            return false;
        }
    }

    onUpdate(callback) {
        if (this.events) {
            this.events.push( { callback, type: 'update' } ) ;
        } else {
            return false;
        }
    }

    onTickerUpdate(symbol, callback) {
        if (this.events) {
            this.events.push( { symbol, callback, type: 'tickerUpdate' } ) ;
        } else {
            return false;
        }
    }

    onPriceAbove(symbol, price, callback) {
        if (this.events) {
            this.events.push( { symbol, price, callback, type: 'priceAbove' } ) ;
        } else {
            return false;
        }
    }

    onPriceBelow(symbol, price, callback) {
        if (this.events) {
            this.events.push( { symbol, price, callback, type: 'priceBelow' } ) ;
        } else {
            return false;
        }
    }

    onPricePercentChange1h(symbol, percent, callback) {
        if (this.events) {
            this.events.push( { symbol, percent, callback, type: 'pricePercentChange1h' } ) ;
        } else {
            return false;
        }
    }

    onPricePercentChange24h(symbol, percent, callback) {
        if (this.events) {
            this.events.push( { symbol, percent, callback, type: 'pricePercentChange24h' } ) ;
        } else {
            return false;
        }
    }

    onPricePercentChange7d(symbol, percent, callback) {
        if (this.events) {
            this.events.push( { symbol, percent, callback, type: 'pricePercentChange7d' } ) ;
        } else {
            return false;
        }
    }

    deleteEvent(event) {
        this.events.splice(this.events.indexOf(event), 1);
        return this;
    }
}

module.exports = CoinMarketCap;

