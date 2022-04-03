const express = require("express");
const ws = require('ws');
const parse = require('url');

const app = express();

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});


// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });
wsServer.on('connection', (socket, request) => {
  
  const { pathname } = parse(request.url);
  
  //set IDXXX to connection;
  socket.uuid = pathname;
  socket.on('message', message => {
    
    //JSON parse;
    
    //find message.IDXXX && sendto it;
    wsServer.findSend(message);
    console.log(message);
    
  });
  
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server

listener.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});


wsServer.findSend = function(message) {
  this.clients.forEach(function(client) {
    if(client.readyState === WebSocket.OPEN) {
      
      if(client.uuid === message.uuid)
      {
        // JSON gen;
        client.send(message);
      }
    }
  });
};

