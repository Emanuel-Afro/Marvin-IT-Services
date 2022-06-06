const ccxt = require("ccxt");
const Binance = require("node-binance-api");
const settings = require("../settings");

const binanceFapi = new ccxt.binance({
	// apiKey: `${settings.api.key}`,
	// secret: `${settings.api.secret}`,
	enableRateLimit: true,
	// options: { defaultType: "future" }
});

const binanceSpot = new ccxt.binance({
	// apiKey: `${settings.api.key}`, // check spot key
	// secret: `${settings.api.secret}`,  // check spot key
	 enableRateLimit: true
});

const nodeBinanceApiClient = new Binance().options({
	//  APIKEY: settings.api.key,
	//  APISECRET: settings.api.secret
});
  
const ftx = new ccxt.ftx({
	// apiKey: `${settings.api.key}`, 
	//  secret: `${settings.api.secret}`,
	 "enableRateLimit": true,
});
  

module.exports = {
	binanceFapi,
	binanceSpot,
	nodeBinanceApiClient,
	ftx
};
  