// client-side js, loaded by index.html
// run by the browser each time the page is loaded


// Global vars
var dataChannelLabel = "op";
var reliableSocket = null;
var peerConnection = null;
var dataChannel = null;
var remoteCandidates = [];
var have_offer = false;

let messagesEl = document.querySelector('.messages');
let peerIdEl = document.querySelector('#connect-to-peer');
let videoEl = document.querySelector('.remote-video');

let logMessage = (message) => {
  let newMessage = document.createElement('div');
  newMessage.innerText = message;
  messagesEl.appendChild(newMessage);
};

/**
 * Add the various callback handlers to the PeerConnection.
 * Shared between both clients.
 */
var setupPeerConnection = function () {

  //peerConnection = new RTCPeerConnection();

  peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: "stun:208.91.197.54:3478"
       }]
  });

  peerConnection.onaddstream = function(obj) {
    videoEl.srcObject = obj.stream;
  }

  peerConnection.onicecandidate = function (event) {
    if (event.candidate) {
      reliableSocket.sendMessage("candidate", event.candidate);
    } else {
      reliableSocket.sendMessage("candidate", {"candidate":""});
      logMessage("All local candidates received");
    }
  };

  peerConnection.ondatachannel = function (event) {
    if (event.channel.label == dataChannelLabel) {
      dataChannel = event.channel;
      logMessage("DataChannel received");
      setupDataChannel(event.channel);
    } else {
      logMessage("Unknown CataChannel label: " + event.channel.label);
    }
  }
};

/**
 * Add the various callback handlers to the DataChannel.
 * Shared between both clients.
 */
var setupDataChannel = function (dataChannel) {
  dataChannel.onopen = function (e) {
    logMessage("DataChannel open and ready to be used");

    $("#send_datachannel_msg").click(function () {
      var msg = $("#datachannel_msg").val();
      logMessage("Sending message: " + msg);
      dataChannel.send(msg);
    });
  };

  dataChannel.onclose = function () {
    logMessage("DataChannel closed");
  };

  dataChannel.onerror = function (e) {
    logMessage("DataChannel error: " + e.message);
    console.log(e);
  };

  dataChannel.onmessage = function (e) {
    logMessage("Received message: " + e.data);
  };
};

var createAnswer = function (msg) {
  setupPeerConnection();

  var desc = new RTCSessionDescription(msg);

  peerConnection.setRemoteDescription(desc)
  .then(function () {
    return peerConnection.createAnswer();
  })
  .then(function(answer) {
    return peerConnection.setLocalDescription(answer);
  })
  .then(function() {
    reliableSocket.sendMessage("answer", peerConnection.localDescription);
  })
  .catch(function () {
    console.log("RTC Error");
  });
};

var handleCandidate = function (msg) {
  var candidate = new RTCIceCandidate(msg);
  peerConnection.addIceCandidate(candidate).then(function () {
    logMessage("New remote candidate received");
  }).catch(function (e) {
    console.log("Error: Failure during addIceCandidate()", e);
  });
}



// Initiate outgoing connection
let connectToPeer = () => {
      var channel_name = $("#channel_name").val();
      var wsAddress = "wss://openhisilicon.glitch.me/" + channel_name;
      console.log("Attempting WebSocket connection to " + wsAddress);

      reliableSocket = new WebSocket(wsAddress);

      reliableSocket.onopen = function (event) {
        // Socket is now ready to send and receive messages
        console.log("reliableSocket is open and ready to use");
        reliableSocket.sendMessage("hello", {});
      };

      reliableSocket.onerror = function (event) {
        // Socket failed to connect
      };

      reliableSocket.onclose = function (event) {
        console.log("ERROR: Reliable socket has closed");
      };

      // Simple helper to send JSON messages with a given type
      reliableSocket.sendMessage = function (type, msg) {
        logMessage("Sending msg of type: " + type);
        var jsonStr = JSON.stringify(msg);
        var msg_clone_ = JSON.parse(jsonStr);
        msg_clone_["type"] = type;
        reliableSocket.send(JSON.stringify(msg_clone_));
      }

      reliableSocket.onmessage = function (event) {
        console.log("Got msg", event);
        var msg = JSON.parse(event.data);

        logMessage("Received msg of type: " + msg.type);
        console.log(msg);

        switch (msg.type) {
          case "offer":
            createAnswer(msg);
            have_offer = true;
            var i = 0;
            for (i = 0; i < remoteCandidates.length; i++) {
              handleCandidate(remoteCandidates[i]);
            }
            break;
          case "candidate":
            if (msg.candidate) {
              if (!have_offer) {
                remoteCandidates.push(msg);
              } else {
                handleCandidate(msg);
              }
            } else {
              console.log("Remote peer has no more candidates");
            }
            break;
          default:
            console.log("WARNING: Ignoring unknown msg of type '" + msg.type + "'");
            break;
        }
      };


    };

window.connectToPeer = connectToPeer;