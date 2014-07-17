'use strict';

var EventEmitter = require('events').EventEmitter;

function Net(url) {
	var websocket = new WebSocket(url);
	this.ws = websocket;
	var that = this;
	websocket.binaryType = 'arraybuffer';
	websocket.onopen = function(event) {
		console.info('Net open', url);
		that.emit('open', event);
	};
	websocket.onerror = function(event) {
		console.info('Net error', event);
		that.emit('error', event);
	};
	websocket.onclose = function(event) {
		console.info('Net close');
		that.emit('close', event);
	};
	websocket.onmessage = function(event) {
		var message = CBOR.decode(event.data);
		switch (typeof message) {
		case 'number':
			that.emit('tick', message);
			break;
		case 'object':
			if(message.hasOwnProperty('T')) {
				var type = message.T|0;
				var value = message.V;
				switch(type) {
					case 1:
						that.emit('SetVelocityMsg', value, event);
						break;
					case 2:
						that.emit('SetTargetMsg', value, event);
						break;
					case 3:
						that.emit('FireMsg', value, event);
						break;
					default:
						that.emit('event', type, value, event);
				}
				break;
			}
		default:
			that.emit('message', message, event);
		}
	};
}
Net.prototype = EventEmitter.prototype;
Net.prototype.constructor = Net;
Net.prototype.close = function() {
	this.ws.close();
}
Net.prototype.send = function(message) {
	this.ws.send(CBOR.encode(message));
}

/*
 * MESSAGES
 */

Net.prototype.SetVelocityMsg = function(data) {
	this.send({T:1, V: data});
}
Net.prototype.SetTargetMsg = function(data) {
	this.send({T:2, V: data});
}
Net.prototype.FireMsg = function(data) {
	this.send({T:3, V: data});
}

module.exports = Net;
