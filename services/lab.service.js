// lab.service.js
const Laboratory = require("@moleculer/lab");

module.exports = {
	mixins: [Laboratory.AgentService],
	settings: {
		token: "testing",
		apiKey: "0GEF3EZ-VK2MP94-MQHS51Y-11CGHY7"
	},
	metrics: {
		enabled: true,
		reporter: "Laboratory"
	},    
	logger: [{
		type: "Console",
		options: { /*...*/ }
	}, "Laboratory"], 
};