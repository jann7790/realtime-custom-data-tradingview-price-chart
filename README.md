# realtime-on-chain-token-price-chart


this project is a demo of how to use tradingview lib to draw a realtime on-chain token price chart.

the example is using the PEPE/WETH pair on uniswap, you can change the pair address in `price_provider.js` to get the chart of other pairs.

upon your rpc server, it can be faster than dexscreener.com, and you can customize the chart as you want.

## how to use

install the dependencies and run the server

    node price_provider.js

open the index.html in browser

![](chart.jpg)


## to-do

- [ ] block price impact by front-run bot



this project is powered by tradinview lib, and rewrote from https://github.com/karthik947/TVChartsOwnData
