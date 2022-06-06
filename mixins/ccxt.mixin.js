"use strict";

const ccxt = require("ccxt");
const isOnline = require("is-online");
const settings = require("../settings");

const binanceFapi = new ccxt.binance({
	apiKey: `${settings.api.key}`,
	secret: `${settings.api.secret}`,
	enableRateLimit: true,
	options: { defaultType: "future" }
});

const binanceSpot = new ccxt.binance({
	apiKey: `${settings.api.key}`,
	secret: `${settings.api.secret}`,
	enableRateLimit: true
});

const ftx = new ccxt.ftx({
	// apiKey: `${config.api.key}`,
	// secret: `${config.api.secret}`,
	"enableRateLimit": true,
});

module.exports = {
	name: "clientsMixin",

	methods: {
		testFromMixin(ctx) {
			this.logger.info("testFromMixin", ctx);
			return ctx;

		},

		async binanceFapiClient(method) {
			// eslint-disable-next-line new-cap
			return await binanceFapi[method]();
		},

		async binanceSpotClient(method) {
			// eslint-disable-next-line new-cap
			return await binanceSpot[method]();
		},

		async ftxClient(method) {
			// eslint-disable-next-line new-cap
			return await ftx[method]();
		},

		
		async networkLatencyBinanceSpot () {
			try {
				if ((await isOnline()) === true) {

					const { recvWindow } = binanceSpot.options.recvWindow;
					const aheadWindow = 1000;
					const localStartTime = await Date.now();
					const { serverTime } = await binanceSpot.publicGetTime();
					const localFinishTime = await Date.now();
					const estimatedLandingTime = (localFinishTime + localStartTime) / 2;
					const diff = serverTime - estimatedLandingTime;
					const latency = localFinishTime - localStartTime;

					// global.marv.status.latencySpot = latency;
					// const latencyInfluxSpot = `latency,type="spot" latencySpot=${latency} ${time}`;
					// pushToInflux.pushToInflux(latencyInfluxSpot);
          
					this.logger.info(`[networkLatencyBinanceSpot] Time: ${Math.abs(diff)} ms ${Math.sign(diff) > 0 ? "behind" : "ahead of"} server. Latency: ${Math.abs(latency)} ms`);
					if (diff < -aheadWindow) {
						this.logger.error(`your request will likely be rejected if local time is ahead of the server's time for more than ${aheadWindow} ms \n`);
					}
					if (diff > recvWindow) {
						this.logger.error(`your request will likely be rejected if local time is behind server time for more than ${recvWindow} ms\n`);
					}
				} else {
					this.logger.error("You are offline, check connection.");
				}
			} catch (error) {
				this.logger.error(error);
			}
		},

		async networkLatencyBinanceFapi () {
			try {
				if ((await isOnline()) === true) {

					
					const { recvWindow } = binanceFapi.options.recvWindow;
					const aheadWindow = 1000;
					const localStartTime = await Date.now();
					const { serverTime } = await binanceFapi.publicGetTime();
					const localFinishTime = await Date.now();
					const estimatedLandingTime = (localFinishTime + localStartTime) / 2;
					const diff = serverTime - estimatedLandingTime;
					const latency = localFinishTime - localStartTime;

					// global.marv.status.latencySpot = latency;
					// const latencyInfluxSpot = `latency,type="spot" latencySpot=${latency} ${time}`;
					// pushToInflux.pushToInflux(latencyInfluxSpot);
          
					this.logger.info(`[networkLatencyBinanceFapi] Time: ${Math.abs(diff)} ms ${Math.sign(diff) > 0 ? "behind" : "ahead of"} server. Latency: ${Math.abs(latency)} ms`);
					if (diff < -aheadWindow) {
						this.logger.error(`your request will likely be rejected if local time is ahead of the server's time for more than ${aheadWindow} ms \n`);
					}
					if (diff > recvWindow) {
						this.logger.error(`your request will likely be rejected if local time is behind server time for more than ${recvWindow} ms\n`);
					}
				} else {
					this.logger.error("You are offline, check connection.");
				}
			} catch (error) {
				this.logger.error(error);
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
		await this.networkLatencyBinanceSpot();
		await this.networkLatencyBinanceFapi();
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}

};
