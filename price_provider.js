const Web3 = require("web3");

const fs = require('fs');
const web3 = new Web3(node_url)
const v3SwapTopic = '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'
const WETH_USDC_contract_address = '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640'
const PEPE_WETH_contract_address = '0x11950d141EcB863F01007AdD7D1A342041227b58'
const addresses = [WETH_USDC_contract_address, PEPE_WETH_contract_address]
const topics = [v3SwapTopic]
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 4000;



let current_second = new Date().getSeconds() // current minute
let current_minute = new Date().getMinutes() // current minute
let open_price = 0
let high_price = 0
let low_price = Infinity
let previous_close_price = 0
let close_price = 0
let eth_price = 0
let volume = 0
let volumeUsd = 0


async function fetchData() {
    let ts = Date.now() / 1000;
    ts = Math.floor(ts / 60) * 60;
    console.log(ts);

    const data = { 
        time: ts, 
        open: open_price,
        high: high_price,
        low: low_price,
        close: close_price,
        volume : volume,
        volumeUsd: volumeUsd
    }
    return data;
}

let data = {};
setInterval(() => {
    const current_date = new Date()
    const current_second_new = current_date.getSeconds()
    const current_minute_new = current_date.getMinutes()

    if (current_minute_new !== current_minute) { 
        current_minute = current_minute_new
        volume = 0
        volumeUsd = 0
        previous_close_price = close_price
        open_price = close_price
        high_price = close_price
        low_price = close_price
        // save data to file
        // fs.appendFile('data.txt', JSON.stringify(data) + '\n', function (err) {
        //     if (err) return console.log(err);
        // });
    }
    current_second = current_second_new

  fetchData()
    .then(newData => {
      data = newData;
      console.log(data)
      if (volume != 0 ) {
        io.emit('KLINE', data);
      }
    })
    .catch(err => console.error('Error fetching data:', err));

}, 1000);


io.on('connection', socket => {
  console.log('New client connected:', socket.id);
//   socket.emit('KLINE', data); // Send current data to the new client
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});












var subscription = web3.eth.subscribe('logs', {
    address: addresses,
    topics: topics
}, function(error, result){
    if (!error){
        log = web3.eth.abi.decodeLog([{
            type:  'int256',
            name: 'amount0'
        },{
            type:  'int256',
            name: 'amount1'
        },{
            type:  'uint160',
            name: 'sqrtPriceX96'
        },{
            type:  'uint128',
            name: 'liquidity'
        },{
            type:  'int24',
            name: 'tick'
        }], result.data, result.topics.slice(1))
        
        if (result.address == WETH_USDC_contract_address){
            eth_price = log.amount0 / log.amount1 * 1e12 * -1
            console.log("eth:", eth_price)
        }
        else if (result.address == PEPE_WETH_contract_address){
            pepe_price = log.amount1 / log.amount0 * -1* eth_price
            // print transaction hash
            console.log("tx:", result.transactionHash)
            console.log("pepe:", pepe_price)
            // calculate pepe ohlc data
            console.log("open:", open_price, "high:", high_price, "low:", low_price, "close:", close_price)
            console.log("open:", open_price, "high:", high_price, "low:", low_price, "close:", close_price)
            volume += Math.abs(log.amount1 / 1e18 * eth_price)
            volumeUsd += log.amount1 / 1e18 * eth_price
            if (previous_close_price != 0) {
                open_price = previous_close_price
                close_price = pepe_price
                let temp_high_price = 0
                let temp_low_price = 0

                if (close_price > open_price){
                    temp_high_price = close_price
                }
                else{
                    temp_high_price = open_price
                }
                if (close_price < open_price){
                    temp_low_price = close_price
                }
                else{
                    temp_low_price = open_price
                }

                if (temp_high_price > high_price){
                    high_price = temp_high_price
                }
                if (temp_low_price < low_price){
                    low_price = temp_low_price
                }
            }
            else{
                // init
                open_price = pepe_price
                high_price = pepe_price
                low_price = pepe_price
                close_price = pepe_price
                previous_close_price = pepe_price
            }



        }
    }
    else
        console.log(error);
});

// unsubscribes the subscription
subscription.unsubscribe(function(error, success){
    if(success)
        console.log('Successfully unsubscribed!');
});