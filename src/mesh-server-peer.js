const RTCPeerConnectionImplementation = require('wrtc').RTCPeerConnection;
const WebSocketImplementation = require('websocket').w3cwebsocket;
const MeshAdapter = require('@tlaukkan/naf-mesh-adapter').MeshAdapter;

exports.MeshServerPeer = class {
    constructor(port, serverPeerUrls, email, secret) {
        this.port = port
        this.email = email
        this.secret = secret
        this.serverPeerUrls = serverPeerUrls
        this.serverPeerUrlArray = serverPeerUrls.split(',')
        this.adapter = new MeshAdapter(RTCPeerConnectionImplementation, WebSocketImplementation);
        this.start()
    }

    start() {
        const self = this

        console.log('server peer starting...')

        this.adapter.setServerPeerUrls(this.serverPeerUrls)

        this.adapter.email = this.email
        this.adapter.secret = this.secret;

        this.adapter.setServerConnectListeners((id) => {
            console.log('connected to signaling server and was assigned client ID: ' + id)
            setTimeout(() => {
                self.repeatedReconnect()
            }, 15000)
        }, () => {
            console.log('signaling server connect failed')
        })

        this.adapter.setRoomOccupantListener((occupantMap) => {
            console.log('occupant change: ' + JSON.stringify(occupantMap))
        })

        this.adapter.setDataChannelListeners((id) => {
                console.log('peer data channel opened from: ' + id)
            }, (id) => {
                console.log('peer data channel closed from: ' + id)
            }, (id, dataType, data) => {
                console.log('peer data channel message from: ' + id + ' ' + dataType + ' ' +data)
            }
        )

        this.adapter.connect()

        console.log('server peer started.')
    }

    close() {
        this.adapter.disconnect()
    }

    repeatedReconnect() {
        const self = this

        self.adapter.peers.forEach((connected, peerUrl) => {
            if (!connected) {
                console.log('cleaning up disconnected peer: ' + peerUrl)
                self.adapter.peers.delete(peerUrl)
            }
        })

        this.serverPeerUrlArray.forEach(serverPeerUrl => {
            if (serverPeerUrl.length > 3) {
                if (!self.adapter.peers.has(serverPeerUrl) || !self.adapter.peers.get(serverPeerUrl)) {
                    console.log('disconnected server peer, attempting to reconnect: ' + serverPeerUrl)
                    self.adapter.startStreamConnection(serverPeerUrl)
                } else {
                    console.log('connected server peer: ' + serverPeerUrl)
                }
            }
        })

        setTimeout(() => {
            self.repeatedReconnect()
        }, 15000)
    }
}

