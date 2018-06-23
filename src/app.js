const RTCPeerConnectionImplementation = require('wrtc').RTCPeerConnection;
const WebSocketImplementation = require('websocket').w3cwebsocket;

const SignalingServer = require('@tlaukkan/webrtc-signaling').SignalingServer;
const MeshServerPeer = require('./mesh-server-peer').MeshServerPeer;

const port = process.env.PORT || 8080;

const signalingServerUrl = process.env.SIGNALING_SERVER_URL || 'wss://tlaukkan-webrtc-signaling.herokuapp.com';
const serverPeerUrls = process.env.SERVER_PEER_URLS || '';
const email = process.env.EMAIL || 'default-email';
const secret = process.env.SECRET || 'default-secret';
const position = process.env.POSITION || '{"x":0, "y":0, "z":0}';
const serverPeerUrlArray = serverPeerUrls.split(',');

if (!process.env.SIGNALING_SERVER_URL) {
    console.warn('SIGNALING_SERVER_URL environment variable not set.')
}
if (!process.env.SERVER_PEER_URLS) {
    console.warn('SERVER_PEER_URLS environment variable not set.')
} else {
    console.log('Server peer URLs are:');
    serverPeerUrlArray.forEach(serverPeerUrl => {
        if (serverPeerUrl.length > 3) {
            console.log(' * ' + serverPeerUrl)
        }
    })
}

if (!process.env.EMAIL ) {
    console.warn('EMAIL environment variable not set.')
}
if (!process.env.SECRET) {
    console.warn('SECRET environment variable not set.')
}
if (!process.env.POSITION) {
    console.warn('POSITION environment variable not set, defaulting to {x:0, y:0, z:0}.')
}

const signalingServer = new SignalingServer('0.0.0.0', port);
const meshServerPeer = new MeshServerPeer(signalingServerUrl, serverPeerUrls, email, secret, position);

process.on('exit', function() {
    signalingServer.close();
    meshServerPeer.close();
});
