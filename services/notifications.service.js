"use strict";

const settings = require("../settings");
const TeleBot = require("telebot");
const dotenv = require("dotenv").config();
const env = process.env.NODE_ENV;

const bot = new TeleBot({
	token: "5302959172:AAFuGza0NkH6xjQ3ISk5sD1HAJTN7wALqpo", // Required. Telegram Bot API token.
	polling: {
		interval: 500, // Optional. How often check updates (in ms).
		timeout: 0, // Optional. Update polling timeout (0 - short polling).
		limit: 100, // Optional. Limits the number of updates to be retrieved.
		retryTimeout: 5000 // Optional. Reconnecting timeout (in ms).
	}
});

const USER =  375809778;

module.exports = {
	name: "notifications",

	actions: {
		async emergencyStop () {
			try {
				this.logger.info("setting shutdown variable to true");
				process.kill(process.pid, "SIGINT");
			} catch (error) {
				this.logger.error(error);
			}
		},
          
		async sendNotification (msg) {
			try {
				bot.sendMessage(USER, `${msg.params}`);
				this.logger.info(`Sending notification: ${msg.params}`);
			} catch (error) {
				this.logger.error(error);
			}
		},
          
		async sendNotificationSilent (msg) {
			try {
				bot.sendMessage(USER, `${msg.params}`, { parseMode: "markdown", replyToMessage: null, replyMarkup: null, notification: false, webPreview: true });
			} catch (error) {
				this.logger.error(error);
			}
		},

		
	},

	methods: {
		hello () {
			this.logger.info("hello, world!");
		}
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
		await this.actions.sendNotificationSilent("bot started");
	},

	/**
 * Service stopped lifecycle event handler
 */
	async stopped() {

	}


};