const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = 4000;

async function fetchData() {
  let ts = Date.now() / 1000;
  // ts = Math.floor(ts / 60) * 60;
  console.log(ts);
  const data = { 
    time: ts, 
    open: Math.random() * 100, 
    high: Math.random() * 100, 
    low: Math.random() * 100, 
    close: Math.random() * 100 
  }
  return data;
}

let data = {};

setInterval(() => {
  fetchData()
    .then(newData => {
      data = newData;
      console.log(data)
      io.emit('KLINE', data);
    })
    .catch(err => console.error('Error fetching data:', err));
}, 1000);


io.on('connection', socket => {
  console.log('New client connected:', socket.id);
  socket.emit('KLINE', data); // Send current data to the new client
});

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
