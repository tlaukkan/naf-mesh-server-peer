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
    heroku create <your-heroku-account>-naf-mesh-server-peer
    heroku config:set EMAIL=<enter your email> SECRET=<enter your secret>
    git push heroku master
    heroku logs -t
---

### Example logs from HEROKU

### Healt check
Signaling server provides 200 OK healthcheck_ /signaling-health-check.

Example: http://127.0.0.1:8080/signaling-health-check

