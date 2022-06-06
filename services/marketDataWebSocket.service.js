"use strict";
const WebSocket = require("ws");
const _ = require("lodash");

const ta = require("../lib/ta");
const { nodeBinanceApiClient } = require("../lib/cryptoClients");

const {
	streamNormalized, normalizeTrades, normalizeBookChanges,
	compute, computeTradeBars, computeBookSnapshots, combine
} = require("tardis-dev");
  
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "marketDataWebSocket",

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

		binanceFapi1Min (ctx) {
			try {

			
				ctx.params.symbolsBinanceWithout.forEach( element => {
					nodeBinanceApiClient.futuresChart(`${element.toUpperCase()}`, "1m", (symbol, interval, chart) => {

						// global.marv.chartsFapi[element.toUpperCase()] = {};
			
						const raw = Object.keys(chart).map(key => chart[key]);
						const open = raw.map(a => a.close * 1);
						const close = raw.map(a => a.close * 1);
						const high = raw.map(a => a.high * 1);
						const low = raw.map(a => a.low * 1);
						const volume = raw.map(a => a.volume * 1);
						const takerBuyBaseVolume = raw.map(a => a.takerBuyBaseVolume * 1);
						const makerBuyBaseVolume = raw.map(a => (a.volume * 1) - (a.takerBuyBaseVolume * 1));

						const emaVolume = ta.ema(volume, 20);
			
						const actualCandle = raw[raw.length - 1];
						const lastClosedCandle = raw[raw.length - 2];
						const last5Candles = _.takeRight(raw, 5);
			
						const ema3 = ta.ema(close, 3);
						const ema5 = ta.ema(close, 5);
						const ema7 = ta.ema(close, 7);
						const ema9 = ta.ema(close, 9);
						const ema21 = ta.ema(close, 21);
						const ema60 = ta.ema(close, 60);
						const ema99 = ta.ema(close, 99);
			
						const atr5 = ta.atr(high, low, close, 5);
						const last5atr5 = _.takeRight(atr5, 5);
			
						const atr9 = ta.atr(high, low, close, 9);
						const last5atr9 = _.takeRight(atr9, 5);
			
						const atr14 = ta.atr(high, low, close, 14);
						const last5atr14 = _.takeRight(atr14, 5);
			
						const bb = ta.bb(close, 20, 2);
						const rsi = ta.rsi(close, 14);
			
						const macd = ta.macd(close);
						const macdHistogram = macd.map(a => a.histogram * 1);
						const last3Macd = _.takeRight(macdHistogram, 3);
			
						const obj = {
							raw,
							open,
							close,
							actualCandle,
							lastClosedCandle,
							ema3,
							ema5,
							ema7,
							ema9,
							ema21,
							ema60,
							ema99,
							atr5,
							atr9,
							atr14,
							bb,
							rsi,
							macd,
							last3Macd,
							last5Candles,
							last5atr5,
							last5atr9,
							last5atr14,
							volume,
							takerBuyBaseVolume,
							makerBuyBaseVolume,
							emaVolume
						};
						// this.logger.info(obj);
						// global.marv.chartsFapi[element.toUpperCase()] = obj;
					}, 100); // the number of cached candles
				});
			} catch (error) {
				this.logger.error(error);
				throw error;
			}
		},

		async binanceSpot1Min () {

		},

		async binanceFapi5Min () {

		},

		async binanceSpot5Min () {

		},

		async tardisClient(ctx) {

			try {
        
				const messagesWithComputedTypes = compute(
					// combinedStream,
					// 5 seconds time bars
					computeTradeBars({ kind: "time", interval: 5 * 1000 }),
					// top 20 levels 50 millisecond order book snapshots
					computeBookSnapshots({ depth: 20, interval: 50 })
					// volume based trade bar - 1 million vol buckets
					// computeTradeBars({ kind: 'volume', interval: 1000 * 1000 })
				);

				const serialize = options => {
					return encodeURIComponent(JSON.stringify(options));
				};
				// other available data types examples:
				// 'book_snapshot_10_100ms', 'derivative_ticker', 'quote',
				// 'trade_bar_10ms', 'trade_bar_10s'
				const dataTypes = ["trade_bar_10s"];
				
				const streamOptions = [
					{
						exchange: "binance",
						symbols: ctx.params.symbolsBinanceWithout,
						dataTypes
					},
					{
						exchange: "binance-futures",
						symbols: ctx.params.symbolsBinanceWithout,
						dataTypes
					}
				];

				const options = serialize(streamOptions);
				const URL = `ws://localhost:8001/ws-stream-normalized?options=${options}`;


				const ws = new WebSocket(URL);
				ws.onmessage = message => {
					this.logger.info(message.data);
				};

			} catch (error) {
				this.logger.error(error);
				throw error;
			}
		}

		
	},

	/**
	 * Events
	 */
	events: {
		"loadActiveSymbols.loaded"(payload) {
			this.actions.tardisClient(payload);
			this.actions.binanceFapi1Min(payload);
		},
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
		// await this.actions.tardisClient();
		// this.logger.error("XXXXXXXXXXXXXXXX WebSocket service started");
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
