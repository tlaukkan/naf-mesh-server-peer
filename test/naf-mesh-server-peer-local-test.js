// eslint-disable-next-line no-unused-vars
const assert = require('assert');
const uuidv4 = require('uuid/v4');

const WebSocketImplementation = (typeof (WebSocket) !== 'undefined') ? WebSocket : require('websocket').w3cwebsocket
const RTCPeerConnectionImplementation = (typeof (RTCPeerConnection) !== 'undefined') ? RTCPeerConnection : require('wrtc').RTCPeerConnection

const MeshServerPeer = require('../src/mesh-server-peer').MeshServerPeer;
const MeshAdapter = require('@tlaukkan/naf-mesh-adapter').MeshAdapter;

describe('naf-mesh-server-peer-local-test', function() {

    it('should connect to local server peer and receive occupant', function(done) {
        this.timeout(10000);
        const meshServerPeer1 = new MeshServerPeer(8082, 'wss://tlaukkan-webrtc-signaling.herokuapp.com', '', 'default-email', 'default-secret')
        const meshServerPeer2 = new MeshServerPeer(8083, 'wss://tlaukkan-webrtc-signaling.herokuapp.com', 'wss://tlaukkan-webrtc-signaling.herokuapp.com/33a1c3f9bfb4cf146be142eedfb8b4c7cd77f1ee47d9da2afcd9d30c81c3fe48', 'default-email-2', 'default-secret-2')

        const adapter1 = new MeshAdapter(RTCPeerConnectionImplementation, WebSocketImplementation);
        adapter1.email = 'adapter1';
        adapter1.secret = 'adapter1';
        adapter1.setSignalServerUrl('wss://tlaukkan-webrtc-signaling.herokuapp.com')
        adapter1.setServerPeerUrls('wss://tlaukkan-webrtc-signaling.herokuapp.com/33a1c3f9bfb4cf146be142eedfb8b4c7cd77f1ee47d9da2afcd9d30c81c3fe48')
        adapter1.connect()

        adapter1.setServerConnectListeners((id) => {
            console.log('adapter 1 connected to server and got id: ' + id)
        }, () => {
            console.log('adapter 1 server connect failed')
        })

        let isDone = false
        adapter1.setRoomOccupantListener((occupantMap) => {
            console.log('adapter 1 occupant change: ' + JSON.stringify(occupantMap));
            if (Object.keys(occupantMap).length === 2) {
                adapter1.disconnect();
                meshServerPeer1.close();
                meshServerPeer2.close();
                if (!isDone) {
                    done()
                    isDone = true
                }
            }
        })

        adapter1.setDataChannelListeners((id) => {
                console.log('adapter 1 data channel opened from: ' + id)
            }, (id) => {
                console.log('adapter 1 data channel closed from: ' + id)
            }, (id, dataType, data) => {
                console.log('adapter 1 data channel message from: ' + id + ' ' + dataType + ' ' +data)
            }
        )

    })

})
