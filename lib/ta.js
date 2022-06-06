const technicalIndicators = require("technicalindicators");
technicalIndicators.setConfig("precision", 8);

const EMA = technicalIndicators.EMA;
const ATR = technicalIndicators.ATR;
const BB = technicalIndicators.BollingerBands;
const RSI = technicalIndicators.RSI;
const MACD = technicalIndicators.MACD;

function bb (close, period, stdDev) {
	try {
		const input = {
			period: period,
			values: close,
			stdDev: stdDev
		};
		const bb = new BB(input);
		//  tulind.indicators.bbands.indicator([close], [period[0], period[1]])
		return  bb.getResult();
	} catch (error) {
		this.logger.error(error);
		throw error;
	}
}
  
function rsi (close, period) {
	try {
		const rsi = new RSI({ period: period, values: close });
		//  tulind.indicators.bbands.indicator([close], [period[0], period[1]])
		return  rsi.getResult();
	} catch (error) {
		this.logger.error(error);
		throw error;
	}
}
  
function macd (close) {
	try {
		const macdInput = {
			values: close,
			fastPeriod: 5,
			slowPeriod: 8,
			signalPeriod: 3,
			SimpleMAOscillator: false,
			SimpleMASignal: false
		};
		const macd = new MACD(macdInput);
		//  tulind.indicators.bbands.indicator([close], [period[0], period[1]])
		return  macd.getResult();
	} catch (error) {
		this.logger.error(error);
		throw error;
	}
}
  
function ema (close, period) {
	try {
		const ema = new EMA({ period: period, values: close });
		// this.logger.info(ema.getResult())
		// const ema =  tulind.indicators.ema.indicator([close], [period])
		return  ema.getResult();
	} catch (error) {
		this.logger.error(error);
		throw error;
	}
}
  
function atr (high, low, close, period) {
	try {
		const atr = new ATR({ high: high, low: low, close: close, period: period });
		// const atr =  tulind.indicators.atr.indicator([high, low, close], [period])
		return  atr.getResult();
	} catch (error) {
		this.logger.error(error);
		throw error;
	}
}


module.exports = {
	ema, 
	atr,
	bb, 
	macd,
	rsi
};