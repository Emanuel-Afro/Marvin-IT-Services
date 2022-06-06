"use strict";

const _ = require("lodash");
const technicalIndicators = require("technicalindicators");

const DbService = require("../mixins/db.mixin");
const cryptoClients = require("../lib/cryptoClients");
const multiTool = require("../lib/multitool");

technicalIndicators.setConfig("precision", 8);

const settings = require("../settings");

module.exports = {
	name: "marketDataPublic",

	mixins: [DbService("marketDataPublic")],
	fields: ["_id", "username", "name"],
	entityValidator: {
		username: "string"
	},
	/**
	 * Settings
	 */
	settings: {

	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		async loadMarketData() {

			const binanceFapiMarkets = await cryptoClients.binanceFapi.loadMarkets();
			const binanceSpotMarkets = await  cryptoClients.binanceSpot.loadMarkets();
			const ftxMarkets = await cryptoClients.ftx.loadMarkets();
		
			const binanceFapiTickers = await cryptoClients.binanceFapi.fetchTickers();
			const binanceSpotTickers = await cryptoClients.binanceSpot.fetchTickers();
			const ftxTickers = await cryptoClients.ftx.fetchTickers();
		
			const obj = {
				markets: {
					binanceFapiMarkets,
					binanceSpotMarkets,
					ftxMarkets,
				},
				tickers : {
					binanceFapiTickers,
					binanceSpotTickers,
					ftxTickers,
				}
			};
			

			return obj;
		},

		async loadActiveSymbols(ctx) {
			const {minVolumeFapi} = settings.settings;

			const marketData = await this.actions.loadMarketData();

			// writing data to inmemory db - check db mixin on github for more info
			await this.actions.create(await marketData);
			this.logger.info(await this.actions.list());
//----------------------------------------------------------------------------------------------------------------
			const binanceFapiTickersArr = multiTool.convertObjectToArray2(marketData.tickers.binanceFapiTickers);
			let newPairs = settings.settings.alwaysInFapi;
			binanceFapiTickersArr.forEach(element=> {
				if(element[1].quote === "BTC"){
					const {symbol} = element[1];
					if(typeof marketData.markets.binanceFapiTickers[symbol]!== "undefined"){
						if(+marketData.tickers.binanceFapiTickers[symbol].quoteVolume > (+minVolumeFapi * 10)){
							newPairs.push(symbol)
						}
					}
				}
			});

			const NewArrWithout = []
			newPairs.forEach(element=>{
				NewArrWithout.push(multiTool.removeSlashFromString(element))
			});

			const uniqueSymbolsWithSlash2 = _.uniq(newPairs);
			const uniqueSymbolsWithoutSlash2 = _.uniq(NewArrWithout);

			const NewObj = {
				symbolsBinanceWith: uniqueSymbolsWithSlash2, 
				symbolsBinanceWithout: uniqueSymbolsWithoutSlash2
			};
//----------------------------------------------------------------------------------------------------------------
			const binanceFapiMarketsArr = multiTool.convertObjectToArray(marketData.markets.binanceFapiMarkets);

			let activePairs = settings.settings.alwaysInFapi;

			binanceFapiMarketsArr.forEach(element => {
				if (element[1].quote === "BUSD" || element[1].quote === "USDT") {

					const {symbol} = element[1];

					if (typeof marketData.markets.binanceSpotMarkets[symbol] !== "undefined") {
						if (+marketData.tickers.binanceFapiTickers[symbol].quoteVolume > (+minVolumeFapi * 10)) {
							activePairs.push(symbol);
						}
					}		
				}
			});
			

			const arrWithout = [];

			activePairs.forEach(element => {
				arrWithout.push(multiTool.removeSlashFromString(element));
			});

			const uniqueSymbolsWithSlash = _.uniq(activePairs);
			const uniqueSymbolsWithoutSlash = _.uniq(arrWithout);

			const obj = {
				symbolsBinanceWith: uniqueSymbolsWithSlash, 
				symbolsBinanceWithout: uniqueSymbolsWithoutSlash
			};

			await ctx.emit("loadActiveSymbols.loaded", obj,NewObj);

			return obj,NewObj;

		},
		
		
	
		

		async getSymbol (ctx) {
			// fetch symbol from in memory db
			// add market info for symbol from inmemory db

			const {symbol} = ctx.params;
			
			return symbol;
		}

	},



	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {
		await this.actions.loadActiveSymbols();
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};