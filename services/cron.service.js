"use strict";

const Schedule = require("moleculer-schedule");

module.exports = {
	name: "scheduler",

	mixins: [Schedule],

	jobs: [
		// {
		// 	rule: "*/5 * * * * *",
		// 	handler: "hello"
		// },
		{
			name: "date",
			rule: "*/15 * * * * *",
			handler () {
				this.broker.logger.info(new Date());
			}
		}
	],

	methods: {
		// hello () {
		// 	this.broker.logger.info("hello, world!");
		// }
	}
};