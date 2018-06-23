const RTCPeerConnectionImplementation = require('wrtc').RTCPeerConnection;
const WebSocketImplementation = require('websocket').w3cwebsocket;
const MeshAdapter = require('@tlaukkan/naf-mesh-adapter').MeshAdapter;

exports.MeshServerPeer = class {
    constructor(signalingServerUrl, serverPeerUrls, email, secret, position) {
        this.closed = false;
        this.email = email;
        this.secret = secret;
        this.signalingServerUrl = signalingServerUrl;
        this.serverPeerUrls = serverPeerUrls;
        this.serverPeerUrlArray = serverPeerUrls.split(',');
        this.position = JSON.parse(position);
        this.adapter = new MeshAdapter(RTCPeerConnectionImplementation, WebSocketImplementation);
        this.start()
    }

    start() {
        const self = this;

        console.log('server peer starting...');

        this.adapter.setServerPeerUrls(this.serverPeerUrls);
        this.adapter.setSignalServerUrl(this.signalingServerUrl);

        this.adapter.email = this.email;
        this.adapter.secret = this.secret;
        this.adapter.position = this.position;

        this.adapter.setServerConnectListeners((id) => {
            console.log('server peer - connected to signaling server and was assigned client ID: ' + id);
            setInterval(() => {
                self.repeatedReconnect();
            }, 10000).unref()
        }, () => {
            console.log('server peer - signaling server connect failed');
        });

        this.adapter.setRoomOccupantListener((occupantMap) => {
            console.log('server peer - occupant change: ' + JSON.stringify(occupantMap));
        });

        this.adapter.setDataChannelListeners((id) => {
                console.log('server peer - peer data channel opened from: ' + id);
                this.adapter.sendData(id, 'u', {
                    0:0,
                    networkId: Math.random().toString(36).substring(2, 9),
                    owner: this.adapter.selfPeerUrl,
                    lastOwnerTime: Date.now(),
                    template:"#server-peer-template",
                    parent:null,
                    components:{position:{x:self.adapter.position.x,y:self.adapter.position.y,z:self.adapter.position.z}, rotation:{x:0,y:0,z:0}}
                });
            }, (id) => {
                console.log('server peer - peer data channel closed from: ' + id);
            }, (id, dataType, data) => {
                //console.log('server peer - peer data channel message from: ' + id + ' ' + dataType + ' ' + JSON.stringify(data))
            }
        );

        this.adapter.connect();

        console.log('server peer - server peer started.');
    }

    close() {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.adapter.disconnect();
    }



    repeatedReconnect() {
        if (this.closed) { return }
        const self = this;

        this.serverPeerUrlArray.forEach(serverPeerUrl => {
            if (serverPeerUrl.length > 3) {
                if (!self.adapter.manager.peers.has(serverPeerUrl)) {
                    console.log('server peer - server peer is not connected, attempting to reconnect: ' + serverPeerUrl);
                    self.adapter.closeStreamConnection(serverPeerUrl);
                    self.adapter.startStreamConnection(serverPeerUrl);
                } else {
                    console.log('server peer - server peer is connected: ' + serverPeerUrl);
                }
            }
        })
    }
};

