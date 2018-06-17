// eslint-disable-next-line no-unused-vars
const assert = require('assert');
const uuidv4 = require('uuid/v4');

const WebSocketImplementation = (typeof (WebSocket) !== 'undefined') ? WebSocket : require('websocket').w3cwebsocket
const RTCPeerConnectionImplementation = (typeof (RTCPeerConnection) !== 'undefined') ? RTCPeerConnection : require('wrtc').RTCPeerConnection

const MeshAdapter = require('@tlaukkan/naf-mesh-adapter').MeshAdapter;

describe('naf-mesh-server-peer-remote-test.js', function() {

    it('should connect to remote server peer and receive occupant', function(done) {
        this.timeout(8000);
        const adapter1 = new MeshAdapter(RTCPeerConnectionImplementation, WebSocketImplementation);
        adapter1.setSignalServerUrl('wss://tlaukkan-webrtc-signaling.herokuapp.com');
        adapter1.email = 'adapter1';
        adapter1.secret = 'adapter1';
        adapter1.setServerUrl('wss://tlaukkan-webrtc-signaling.herokuapp.com/31980bbf28e4b66e72ab49bebeb20da4f67a090c514d56c549f26caaf65a076c');
        adapter1.connect();

        adapter1.setServerConnectListeners((id) => {
            console.log('adapter connected to server and got id: ' + id)
        }, () => {
            console.log('adapter server connect failed')
        })

        adapter1.setRoomOccupantListener((occupantMap) => {
            console.log('adapter 1 occupant change: ' + JSON.stringify(occupantMap))
            if (Object.keys(occupantMap).length === 2) {
                adapter1.disconnect()
                done()
            }
        })

        adapter1.setDataChannelListeners((id) => {
                console.log('adapter data channel opened from: ' + id)
            }, (id) => {
                console.log('adapter data channel closed from: ' + id)
            }, (id, dataType, data) => {
                console.log('adapter data channel message from: ' + id + ' ' + dataType + ' ' +data)
            }
        )

    })

})
