"use strict";
const config = require("../settings");
const DbService = require("../mixins/db.mixin");

const { InfluxDB } = require("@influxdata/influxdb-client");
const { HealthAPI } = require("@influxdata/influxdb-client-apis");

const timeout = 2000;
const org = "marvin";
const bucket = "marvin-bot";

const influxClient = new InfluxDB({ url: config.influx.url, token: config.influx.token, timeout });

const mongojs = require("mongojs");
const mongo = `${config.db.user}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`;
const mongoConnection = mongojs(String(mongo));

module.exports = {
	name: "db",

	mixins: [DbService("articles")],

	actions: {
		async checkInfluxHealth () {
			const healthAPI = new HealthAPI(influxClient);

			healthAPI
				.getHealth()
				.then((result /* : HealthCheck */) => {
					this.logger.info(JSON.stringify(result, null, 2));
					this.logger.info("Health:", result.status === "pass" ? "OK" : "NOT OK");
					this.logger.info("Finished success");
				})
				.catch(error => {
					this.logger.error(error);
					this.logger.error("Finished ERROR");
				});
		},

		async writeToInflux (data) {
			try {
				// logger.time('influx')
				const writeApi = influxClient.getWriteApi(org, bucket, "ms");
			
				writeApi.writeRecord(data);
			
				// https://github.com/influxdata/influxdb-client-js/issues/261
				await writeApi
					.flush()
				// .then(() => {
				//   logger.info('connected to influx')
				//   logger.timeEnd('influx')
				// })
					.catch(e => {
						this.logger.error(e);
						this.logger.error("\nFinished ERROR");
						throw e;
					});
			} catch (error) {
				this.logger.info(error);
				throw error;
			}
		},


		async readFromInfluxCustomMeasurement (symbol, typeOfValue) {
			try {
				this.logger.time("influx read");
				const readFromInflux = influxClient.getQueryApi(org);
			
				const query = `from(bucket: "${bucket}") 
				|> range(start: -1h) 
				|> filter(fn: (r) =>
				r._measurement == "priceDifference" and r.symbol == "${symbol}")
				|> ${typeOfValue}()
				`;
				readFromInflux.queryRows(query, {
					next (row, tableMeta) {
						const o = tableMeta.toObject(row);
			
						const obj = {
							[typeOfValue]: {
								o
							}
						};
						this.logger.info(obj);
					},
					error (error) {
						this.logger.info(error);
						this.logger.info("\nFinished ERROR");
					},
					complete () {}
				});
				this.logger.timeEnd("influx read");
			} catch (error) {
				this.logger.info(error);
				throw error;
			}
		},

		async queryInfluxCustomQuery (queryInFluxLanguage, type) {
			try {
				this.logger.time(`influx read custom query ${type}`);
				const readFromInflux = influxClient.getQueryApi(org);

				const query = `from(bucket: "${bucket}")${queryInFluxLanguage}`;

				const arrayForTempResults = [];

				await readFromInflux
					.collectRows(query /*, you can specify a row mapper as a second arg */)
					.then(data => {
						data.forEach(x => arrayForTempResults.push(JSON.stringify(x)));
					})
					.catch(error => {
						console.error(error);
						console.log("\nCollect ROWS ERROR");
					});

				this.logger.timeEnd(`influx read custom query ${type}`);

				// logger.info(data)
				return arrayForTempResults;
			} catch (error) {
				this.logger.info(error);
				throw error;
			}
		},

		async readFromInflux () {
			this.logger.info("reading from influx");
		},

		async checkMongoHealth () {
			mongoConnection.runCommand({ ping: 1 }, function (err, res) {
				if (!err && res.ok) this.logger.info("MongoDB is up and running");
			});
		},

		async writeToMongo(coll, data) {
			try {
				const mycollection = mongoConnection.collection(coll);
				const input = { ...data };
				input.date = Date.now();
			
				mongoConnection.setMaxListeners(20);
			
				mongoConnection.on("error", function (err) {
					this.logger.error("[pushToDB] database error", err);
				});
			
				mongoConnection.on("connect", function () {
					// logger.info('[pushToDB] database connected')
				});
				await mycollection.save(input, function (err, saved) {
					if (err || !saved) { this.logger.error(`[pushToDB] Data ${coll} not written to DB`); } else { this.logger.info(`[pushToDB] Data ${coll} written to DB`); }
					// mongoConnection.close()
				});
			} catch (error) {
				this.logger.info(error);
				throw error;
			}
		},

		async readFromMongo() {

		}
	},

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
		// broker.call("db.find").then(console.log);
		// await this.read()
	},
	
	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {
	
	}
	
};