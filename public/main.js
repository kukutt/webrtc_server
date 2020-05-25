// client-side js, loaded by index.html
// run by the browser each time the page is loaded

let peer = new Peer({
  host: '/',
  path: '/peerjs/myapp'
});
peer.on('open', (id) => {
  console.log('My peer ID is: ' + id);
});
peer.on('error', (error) => {
  console.error(error);
});

console.log("hello world :o");

