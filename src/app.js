const webrtc = require('wrtc');
const SignalingServer = require('@tlaukkan/webrtc-signaling').SignalingServer;
const MeshAdapter = require('./mesh-adapter').MeshAdapter;

const port = process.env.PORT || 8080;

const serverPeerUrls = process.env.SERVER_PEER_URLS || '';
const email = process.env.SERVER_PEER_EMAIL || 'default-email';
const secret = process.env.SERVER_PEER_SECRET || 'default-secret';
const serverPeerUrlArray = serverPeerUrls.split(',')

if (!serverPeerUrls) {
    console.log('Server peer URLs are:')
    serverPeerUrlArray.forEach(serverPeerUrl => {
        if (serverPeerUrl.length > 3) {
            console.log(' * ' + serverPeerUrl)
        }
    })
} else {
    console.log('Server peer URLS are not set.')
}

if (email == 'default-email') {
    console.log('SIGNALING SERVER LOGIN EMAIL NOT SET !!!')
}
if (secret == 'default-secret') {
    console.log('SIGNALING SERVER LOGIN SECRET NOT SET !!!')
}

const signalingServer = new SignalingServer('0.0.0.0', port)

const adapter = new MeshAdapter(webrtc.RTCPeerConnection);
adapter.setServerPeerUrls(serverPeerUrls)

adapter.email = email
adapter.secret = secret;

adapter.setServerConnectListeners((id) => {
    console.log('connected to signaling server and got id: ' + id)
}, () => {
    console.log('signaling server connect failed')
})

adapter.setRoomOccupantListener((occupantMap) => {
    console.log('occupant change: ' + JSON.stringify(occupantMap))
})

adapter.setDataChannelListeners((id) => {
        console.log('peer data channel opened from: ' + id)
    }, (id) => {
        console.log('peer data channel closed from: ' + id)
    }, (id, dataType, data) => {
        console.log('peer data channel message from: ' + id + ' ' + dataType + ' ' +data)
    }
)

adapter.connect()

process.on('exit', function() {
    signalingServer.close()
    adapter.close()
});

repeatedReconnect()

function repeatedReconnect() {

    adapter.peers.forEach((connected, peerUrl) => {
        if (!connected) {
            console.log('cleaning up disconnected peer: ' + peerUrl)
            adapter.peers.delete(peerUrl)
        }
    })

    serverPeerUrlArray.forEach(serverPeerUrl => {
        if (serverPeerUrl.length > 3) {
            if (!adapter.peers.has(serverPeerUrl) || !adapter.peers.get(serverPeerUrl)) {
                console.log('disconnected server peer, attempting to reconnect: ' + serverPeerUrl)
                adapter.startStreamConnection(serverPeerUrl)
            } else {
                console.log('connected server peer: ' + serverPeerUrl)
            }
        }
    })

    setTimeout(() => {
        repeatedReconnect()
    }, 15000)
}
