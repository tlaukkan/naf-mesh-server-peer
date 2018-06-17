const RTCPeerConnectionImplementation = require('wrtc').RTCPeerConnection;
const WebSocketImplementation = require('websocket').w3cwebsocket;

const SignalingServer = require('@tlaukkan/webrtc-signaling').SignalingServer;
const MeshServerPeer = require('./mesh-server-peer').MeshServerPeer;

const port = process.env.PORT || 8080;

const serverPeerUrls = process.env.SERVER_PEER_URLS || '';
const email = process.env.EMAIL || 'default-email';
const secret = process.env.SECRET || 'default-secret';
const serverPeerUrlArray = serverPeerUrls.split(',')

if (serverPeerUrls.length > 3) {
    console.log('Server peer URLs are:')
    serverPeerUrlArray.forEach(serverPeerUrl => {
        if (serverPeerUrl.length > 3) {
            console.log(' * ' + serverPeerUrl)
        }
    })
} else {
    console.warn('SERVER_PEER_URLS environment variable not set.')
}

if (email == 'default-email') {
    console.warn('EMAIL environment variable not set.')
}
if (secret == 'default-secret') {
    console.warn('SECRET environment variable not set.')
}

const signalingServer = new SignalingServer('0.0.0.0', port)
const meshServerPeer = new MeshServerPeer(port, serverPeerUrls, email, secret)

process.on('exit', function() {
    signalingServer.close()
    meshServerPeer.close()
});
