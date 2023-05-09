const socket = io.connect('http://127.0.0.1:4000/');



const chartProperties = {
	width: 600,
	height: 600,
	autoSize: true,
	timeScale: {
		timeVisible: true,
		secondsVisible: true,
	}
 
};

const domElement = document.getElementById('tvchart');
const chart = LightweightCharts.createChart(domElement, chartProperties);
const candleSeries = chart.addCandlestickSeries();
const volumeSeries = chart.addHistogramSeries({
	color: '#26a69a',
	priceFormat: {
		type: 'volume',
	},
	priceScaleId: '', // set as an overlay by setting a blank priceScaleId
	// set the positioning of the volume series
	scaleMargins: {
		top: 0.7, // highest point of the series will be 70% away from the top
		bottom: 0,
	},
});
volumeSeries.priceScale().applyOptions({
	scaleMargins: {
		top: 0.9, // highest point of the series will be 70% away from the top
		bottom: 0,
	},
});



candleSeries.applyOptions({
    priceFormat: {
        type: 'price',
        precision: 10,
        minMove: 0.0000000001,
    },
});



socket.on('KLINE',(pl)=>{
  console.log(pl);
  candleSeries.update(pl);
  volumeSeries.update({time: pl.time, value: Math.abs(pl.volume), color: pl.volume < 0 ? '#26a69a' : '#ef5350'});
});