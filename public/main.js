// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let messagesEl = document.querySelector('.messages');
let peerIdEl = document.querySelector('#connect-to-peer');
let videoEl = document.querySelector('.remote-video');

let logMessage = (message) => {
  let newMessage = document.createElement('div');
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
};

let renderVideo = (stream) => {
  videoEl.srcObject = stream;
  videoEl.onloadedmetadata = (e) => videoEl.play();
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
peer.on('call', (call) => {
  navigator.mediaDevices.getUserMedia({video: true, audio: true}, (stream) => {
    call.answer(stream); // Answer the call with an A/V stream.
    call.on('stream', renderVideo);
  }, (err) => {
    console.error('Failed to get local stream', err);
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
  
  navigator.mediaDevices.getUserMedia({video: true, audio: true}, (stream) => {
    let call = peer.call(peerId, stream);
    call.on('stream', renderVideo);
  }, (err) => {
    logMessage('Failed to get local stream', err);
  });
};

window.connectToPeer = connectToPeer;