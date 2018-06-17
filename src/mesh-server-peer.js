const RTCPeerConnectionImplementation = require('wrtc').RTCPeerConnection;
const WebSocketImplementation = require('websocket').w3cwebsocket;
const MeshAdapter = require('@tlaukkan/naf-mesh-adapter').MeshAdapter;

exports.MeshServerPeer = class {
    constructor(port, signalingServerUrl, serverPeerUrls, email, secret) {
        this.closed = false
        this.port = port
        this.email = email
        this.secret = secret
        this.signalingServerUrl = signalingServerUrl
        this.serverPeerUrls = serverPeerUrls
        this.serverPeerUrlArray = serverPeerUrls.split(',')
        this.adapter = new MeshAdapter(RTCPeerConnectionImplementation, WebSocketImplementation);
        this.start()
    }

    start() {
        const self = this

        console.log('server peer starting...')

        this.adapter.setServerPeerUrls(this.serverPeerUrls)
        this.adapter.setSignalServerUrl(this.signalingServerUrl)

        this.adapter.email = this.email
        this.adapter.secret = this.secret;

        this.adapter.setServerConnectListeners((id) => {
            console.log('server peer - connected to signaling server and was assigned client ID: ' + id)
            setInterval(() => {
                self.repeatedReconnect()
            }, 15000).unref()
        }, () => {
            console.log('server peer - signaling server connect failed')
        })

        this.adapter.setRoomOccupantListener((occupantMap) => {
            console.log('server peer - occupant change: ' + JSON.stringify(occupantMap))
        })

        this.adapter.setDataChannelListeners((id) => {
                console.log('server peer - peer data channel opened from: ' + id)
            }, (id) => {
                console.log('server peer - peer data channel closed from: ' + id)
            }, (id, dataType, data) => {
                console.log('server peer - peer data channel message from: ' + id + ' ' + dataType + ' ' +data)
            }
        )

        this.adapter.connect()

        console.log('server peer - server peer started.')
    }

    close() {
        if (this.closed) {
            return
        }
        this.closed = true
        this.adapter.disconnect()
    }



    repeatedReconnect() {
        if (this.closed) { return }
        const self = this

        this.serverPeerUrlArray.forEach(serverPeerUrl => {
            if (serverPeerUrl.length > 3) {
                if (!self.adapter.peers.has(serverPeerUrl) || !self.adapter.peers.get(serverPeerUrl)) {
                    console.log('server peer - server peer is not connected, attempting to reconnect: ' + serverPeerUrl)
                    self.adapter.startStreamConnection(serverPeerUrl)
                } else {
                    console.log('server peer - server peer is connected: ' + serverPeerUrl)
                }
            }
        })
    }
}

