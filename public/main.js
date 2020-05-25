// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let messagesEl = document.querySelector('.messages');
let peerIdEl = document.querySelector('#connect-to-peer');

let logMessage = (message) => {
  let newMessage = document.createElement('div');
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
};

let peer = new Peer({
  host: '/',
  path: '/peerjs/myapp'
});
peer.on('open', (id) => {
  logMessage('My peer ID is: ' + id);
});
peer.on('error', (error) => {
  console.error(error);
});
peer.on('connection', (conn) => {
  logMessage('incoming peer connection!');
  conn.on('data', (data) => {
    logMessage(`received: ${data}`);
  });
  conn.on('open', () => {
    conn.send('hello!');
  });
});

let connectToPeer = () => {
  let peerId = peerIdEl.value;
  logMessage(`Connecting to ${peerId}...`);
  
  let conn = peer.connect(peerId);
  conn.on('data', (data) => {
    logMessage(`received: ${data}`);
  });
  conn.on('open', () => {
    conn.send('hi!');
  });
};

window.connectToPeer = connectToPeer;