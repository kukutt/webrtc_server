const express = require("express");
const ws = require('ws');
const parse = require('url');
const http = require('http');

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
const wsServer = new ws.Server({ noServer: true,});


// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server

listener.on('upgrade', (request, conn, head) => {
  wsServer.handleUpgrade(request, conn, head, conn => {
    wsServer.emit('connection', conn, request);
  });
});


wsServer.on('connection', (conn, request) => {
  
  conn.uuid = request.url;

  conn.on('message', message => {
    var msg;
    console.log(message);
    msg = JSON.parse(message);

    wsServer.clients.forEach(function each(client) 
    {
      if(client.uuid === msg["dst"])
      {
        msg["src"]
        var rsp = JSON.stringify(msg);
        client.send(rsp);
      } 
    });
  });
});





