"use strict";

const cryptoClients = require("../lib/cryptoClients");
const ccxt = require("../mixins/ccxt.mixin");
const multiTool = require("../lib/multiTool");

const WebSocket = require("ws");
const delay = require("delay");

const settings = require("../settings");
const delayWebsocketsCheck = settings.settings.timeoutWebsocketCheck;

module.exports = {
	name: "marketDataPrivate",

	mixins: [ccxt],

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
		async binanceFapiMarketBuy () {},
		async binanceFapiMarketSell () {},

		
		async binanceFapiCombinedLong(symbol) {

			console.info( await cryptoClients.nodeBinanceApiClient.futuresLeverage( symbol, settings.settings.futuresLeverage ) );

			let orders = [
				{
					symbol,
					side: "BUY",
					type: "MARKET",
					quantity: "0.01",
				},
				{
					symbol,
					side: "SELL",
					type: "MARKET",
					quantity: "0.5",
					reduceOnly: true
				}
			];

			console.info( await cryptoClients.nodeBinanceApiClient.futuresMultipleOrders(orders) );
		},
		async binanceFapiCombinedShort(symbol) {

			console.info( await cryptoClients.nodeBinanceApiClient.futuresLeverage( symbol, settings.settings.futuresLeverage ) );

			let orders = [
				{
					symbol:symbol,
					side: "BUY",
					type: "MARKET",
					quantity: "0.01",
				},
				{
					symbol,
					side: "SELL",
					type: "MARKET",
					quantity: "0.5",
					reduceOnly: true
				}
			];
			console.info( await cryptoClients.nodeBinanceApiClient.futuresMultipleOrders(orders) );
		},

		async binanceRebalanceSpotFapi () {},

		async binanceFapiGetBalanceAndPosition () {
			try {
				// https://binance-docs.github.io/apidocs/futures/en/#account-information-v2-user_data
				const balanceAndPositions = await cryptoClients.nodeBinanceApiClient.futuresAccount();
				// this.logger.info(await balanceAndPositions);

				this.logger.info(await balanceAndPositions.totalWalletBalance);

				balanceAndPositions.assets.forEach(element => {
					+element.walletBalance > 0 && this.logger.info(element.asset, element.walletBalance);
				});

				const obj = {

				};
			
				return obj; 
			} catch (error) {
				this.logger.error(error);
				// await Multitool.betterError(error, "");
			}
			
		},
		async binanceSpotGetBalance () {
			try {
				await cryptoClients.nodeBinanceApiClient.balance((error, balances) => {
					multiTool.convertObjectToArray(balances).forEach(element => {
						let symbol = element[0];
						let available = element[1].available;
						let onOrder = element[1].onOrder;

						+available > 0 && this.logger.info(symbol, available, onOrder);
					});
				});     
			} catch (error) {
				this.logger.info(error);
			}
			
		},
		async binanceCombinedBalance () {}
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
		async openBinanceUserDataStreamSpot () {
			try {
				const listenKey = await this.binanceSpotClient("publicPostUserDataStream");
				this. logger.info(`[WSS] listenkey | ${listenKey.listenKey}`);
				const url = `wss://stream.binance.com:9443/stream?streams=${listenKey.listenKey}`;
				const userDataStreamConnection = new WebSocket(url);
			
				// check connection status and restart		
				// const checkIfTimeout = () => {
				//   if (global.marv.wsStatus.timeout === true) {
				// 	userDataStreamConnection.close()
				// 	delay(200)
				// 	userDataStreamConnection.terminate()
				//   }
				// }
				// setInterval(
				//   checkIfTimeout, delayWebsocketsCheck
				// )
			
				userDataStreamConnection.onopen = () => {
					this.logger.info("**** Websockets userDataStreamConnection open ****");
				};
			
				userDataStreamConnection.on("ping", (data) => {
					this.logger.info(`[WSS] Got a ping from the userDataStreamConnection: ${data}`);
				});
			
				userDataStreamConnection.onerror = (error) => {
					this.error.info(`!!! WebSocket userDataStreamConnection error: ${error}`);
					this.error.info(`${JSON.stringify(error)}`);
				};
			
				userDataStreamConnection.onclose = () => {
					this.logger.info("**** Websockets userDataStreamConnection closed ****");
				};
			
				userDataStreamConnection.onmessage = (e) => {
				//   global.marv.wsStatus.userDataSpot = Date.now();
				//   global.marv.wsStatus.lastMessageSpot = Date.now();
			
					const objJSON = JSON.parse(e.data);
			
					if (objJSON.data.e === "executionReport") {
						this.logger.info(`[WSS] executionReport Update: ID: ${objJSON.data.i} | Status: ${objJSON.data.X}`);
						const key = objJSON.data.i;
						// global.marv.tradesRAWSpot.push(objJSON.data)
						const findExisting = global.marv.tradesSpot.findIndex(trade => trade.i === key);
						if (objJSON.data.e === "executionReport") {
							if (findExisting === -1) {
								// global.marv.tradesSpot.push(objJSON.data)
							} else {
								// global.marv.tradesSpot[findExisting] = objJSON.data
							}
						}
					}
			
					if (objJSON.data.e === "outboundAccountInfo") {
						this.logger.info(`[WSS] Spot outboundAccountInfo  Update: ${JSON.stringify(objJSON.data)}`);
					// global.marv.WSSBalance = objJSON.data
					}
				};
			} catch (e) {
				// telegramController.sendNotification(JSON.stringify(`Error websocketUserDataStream: ${e}`));
				this.logger.error(e);
				throw e;
			}
		},

		async openBinanceUserDataStreamFapi () {
			try {
		
				const listenKeyFapi = await this.binanceFapiClient("fapiPrivatePostListenKey");
				// TODO cache key
				this.logger.info(`[WSS Fapi] listenkey | ${listenKeyFapi.listenKey}`);
		
				const url = `wss://fstream.binance.com/ws/${listenKeyFapi}`;
				const userDataStreamConnectionFapi = new WebSocket(url);
		
				// check connection status and restart
				// const checkIfTimeout = () => {
				// 	if (global.marv.wsStatus.timeout === true) {
				// 		userDataStreamConnectionFapi.close();
				// 		delay(200);
				// 		userDataStreamConnectionFapi.terminate();
				// 	}
				// };
				// setInterval(
				// 	checkIfTimeout, delayWebsocketsCheck
				// );
		
				userDataStreamConnectionFapi.onopen = () => {
					this.logger.info("**** Websockets userDataStreamFapiConnection open ****");
				};
		
				userDataStreamConnectionFapi.on("ping", (data) => {
					this.logger.info(`[WSS] Got a ping from the userDataStreamFapiConnection: ${data}`);
				});
		
				userDataStreamConnectionFapi.onerror = (error) => {
					this.error.info(`!!! WebSocket userDataStreamFapiConnection error: ${error}`);
					this.error.info(`${JSON.stringify(error)}`);
				};
		
				userDataStreamConnectionFapi.onclose = () => {
					this.logger.info("**** Websockets userDataStreamFapiConnection closed ****");
				};
		
				userDataStreamConnectionFapi.onmessage = (e) => {
					// global.marv.wsStatus.fapiUserData = Date.now();
					// global.marv.wsStatus.lastMessage = Date.now();
		
					const objJSON = JSON.parse(e.data);
					// global.marv.accountUpdatesFapi.push(objJSON);
		
					if (objJSON.e === "ORDER_TRADE_UPDATE") {
						this.logger.info(`[WSS] Fapi ORDER_TRADE_UPDATE Update: OrderID: ${objJSON.o.i} | TradeID: ${objJSON.o.t} | Status: ${objJSON.o.X}`);
		
						const tradeId = objJSON.o.t;
						const orderId = objJSON.o.i;
		
						// global.marv.tradesRAWFapi.push(objJSON);
						// global.marv.ordersRAWFapi.push(objJSON);
		
						const findExistingOrder = global.marv.ordersFapi.findIndex(trade => trade.o.i === orderId);
		
						if (findExistingOrder === -1) {
							this.logger.info(`Order ID ${orderId} pushed to ordersFapi`);
							// global.marv.ordersFapi.push(objJSON);
						} else {
							this.logger.info(`Order ID ${orderId} updated to ordersFapi`);
							// global.marv.ordersFapi[findExistingOrder] = objJSON;
						}
		
						const findExistingTrade = global.marv.tradesFapi.findIndex(trade => trade.o.t === tradeId);
		
						if (findExistingTrade === -1) {
							this.logger.info(`trade ID ${tradeId} pushed to tradesFapi`);
							// global.marv.tradesFapi.push(objJSON);
						} else {
							this.logger.info(`trade ID ${tradeId} updated tradesFapi`);
							// global.marv.tradesFapi[findExistingOrder] = objJSON;
						}
					}
		
					if (objJSON.e === "listenKeyExpired") {
						this.logger.info(`[WSS] listenKeyExpired Fapi Update: 
						${JSON.stringify(objJSON)}`);
					}
		
					if (objJSON.e === "ACCOUNT_UPDATE") {
						this.logger.info(`[WSS] ACCOUNT_UPDATE Fapi Update: 
						${JSON.stringify(objJSON)}`);
						// global.marv.WSSBalanceFapi = objJSON;
					}
		
					if (objJSON.e === "MARGIN_CALL") {
						this.logger.info(`[WSS] MARGIN_CALL Fapi Update: 
						${JSON.stringify(objJSON)}`);
					}
				};
		
				// if (global.marv.lastMessageWSTickerTimeoutFapi === "timeout") {
				// 	userDataStreamConnectionFapi.terminate();
				// }
			} catch (e) {
				// telegramController.sendNotification(JSON.stringify(`Error websocketUserDataStreamFapi: ${e}`));
				this.logger.error(e);
				throw e;
			}
		},
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
		await this.actions.binanceSpotGetBalance();
		await this.actions.binanceFapiGetBalanceAndPosition();
		// await this.openBinanceUserDataStreamSpot();
		// await this.openBinanceUserDataStreamFapi();
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};