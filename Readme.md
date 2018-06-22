# Server peer for Networked A-Frame peer to peer mesh

This library implements Server peer for Networked A-Frame peer to peer mesh

## Usage

# Publish package

## First publish

---
    npm publish --access public
---

## Update

---
    npm version patch
    npm publish
---

## Deploying signaling server to heroku

### Preparation 

* Checkout this project from github.
* Install heroku cli.

### Commands

---
    git clone https://github.com/tlaukkan/naf-mesh-server-peer.git
    cd naf-mesh-server-peer
    heroku create <your-heroku-account>-naf-mesh-server-peer
    heroku config:set EMAIL=<enter your email> SECRET=<enter your secret>
    heroku config:set SERVER_PEER_URLS=wss://tlaukkan-webrtc-signaling.herokuapp.com/31980bbf28e4b66e72ab49bebeb20da4f67a090c514d56c549f26caaf65a076c
    heroku config:set SERVER_PEER_URLS=wss://tlaukkan-webrtc-signaling.herokuapp.com/89ed4429186f2fe11150fc35f3c0c591ebed7b56c3ae443ed3129285bd3b533d
    heroku config:set POSITION="{\"x\":0, \"y\":2, \"z\":0}"
    
2018-06-14T21:11:34.850449+00:00 app[web.1]: connected to signaling server and was assigned client ID: wss://tlaukkan-webrtc-signaling.herokuapp.com/31980bbf2z
    git push heroku master
    heroku logs -t
---

### Example logs from HEROKU

### Healt check
Signaling server provides 200 OK healthcheck_ /signaling-health-check.

Example: http://127.0.0.1:8080/signaling-health-check

