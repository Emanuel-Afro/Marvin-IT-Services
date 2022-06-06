const dotenv = require("dotenv").config();

const env = process.env.NODE_ENV;

const settings = {
	ignoreSymbolSpot: [],
	ignoreSymbolFapi: ["1000SHIBUSDT", "LENDUSDT", "BTCBUSD_210129", "BTCBUSD_210226", "DOTECOUSDT", "BTCUSDT_210326", "ETHUSDT_210326", "BTCUSDT_210625", "ETHUSDT_210625", "ETHUSDT_210924", "BTCUSDT_210924", "BZRXUSDT"],
	ignoreGroupsSpot: ["456", "TUSD", "PAX", "USDC", "XRP", "USDS", "TRX", "BUSD", "NGN", "RUB", "TRY", "EUR", "ZAR", "BKRW", "IDRT", "GBP", "UAH", "BIDR", "AUD", "DAI", "NGN", "BRL", "BVND", "VAI", "BTS", "GYEN"],
	ignoreGroupsFapi: ["BUSD"],
	alwaysInSpot: ["BNB/USDT", "BTC/USDT", "BNB/BTC", "FTM/USDT", "MATIC/USDT", "DOGE/USDT"],
	alwaysInFapi: ["BNB/USDT", "BTC/USDT", "FTM/USDT", "MATIC/USDT", "DOGE/USDT", "BNB/BUSD"],
	//
	sessionDuration: 3600000,
	//
	orderBookDepth: 10,
	//
	minAmountOfPairs: 10,
	minVolumeSpot: 50000000,
	minVolumeFapi: 50000000,
	//
	positionSizeSpot: 0.5,
	positionSizeFapi: 0.9,
	maxDrawdown: 0.1,
	maxPositionLoss: 0.02,
	targetPositionGain: 0.04,
	//
	minimumAmountOf1SecondCandles: 75,
	//
	delays: {
		delayCheckStep: 1000,
		delayTradeManager: 1000
	},
	//
	timeoutWebsocketCheck: 5000,
	timeoutWebsocketCheckWaitToRestart: 2000,
	//
	gainsSpot: 0.003,
	gainsFapi: 0.003,
	//
	triggerGainsSpot: 0.002,
	triggerGainsFapi: 0.002,
	//
	takeProfitSpot: 0.00177,
	takeProfitFapi: 0.00177,
	//
	stopLossSpot: 0.003,
	stopLossFapi: 0.003,
	//
	triggerStopLossSpotAtr: 0.8,
	triggerStopLossFapiAtr: 0.8,
	//
	feesSpot: 0.0005,
	feesSpotMarket: 0.00075,
	feesFapi: 0.0002,
	feesFapiMarket: 0.0004,
	//
	emaCrossPreviousMinutes: 3,
	//
	balanceDifferenceThreshold: 0.1,
	safePositionOrderbook: 2,
	fapiLeverage: 2,
	timeframeForRelativeDrawdownInHours: 1,
	minTradeDuration: 7777
};

const production = {
	settings,
	app: {
		port: 3000
	},
	db: {
		user: "marvin",
		password: "marvin",
		host: "127.0.0.1",
		port: 27017,
		name: "marvin-binance"
	},
	api: {
		key: process.env.APIKEY_PROD,
		secret: process.env.APISECRET_PROD
	},
	telegram: {
		token: "5302959172:AAFuGza0NkH6xjQ3ISk5sD1HAJTN7wALqpo"
	},
	influx: {
		url: "http://localhost:8086",
		token: process.env.INFLUX
	}
};

const test = {
	settings,
	app: {
		port: 3000
	},
	db: {
		user: "marvin",
		password: "marvin",
		host: "127.0.0.1",
		port: 27017,
		name: "marvin-binance"
	},
	api: {
		key: process.env.APIKEY,
		secret: process.env.APISECRET
	},
	telegram: {
		token: process.env.TOKEN_TEST
	},
	influx: {
		url: "http://localhost:8086",
		token: process.env.INFLUX
	}
};

const config = {
	production,
	test
};

console.log("process env from config file. Node ENV:", process.env.NODE_ENV);

module.exports = config[env];