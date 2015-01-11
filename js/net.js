'use strict';

var EventEmitter = require('events').EventEmitter;
var CBOR = window.CBOR;
var M_SetVelocityMsg = 1,
	M_SetTargetMsg = 2,
	M_CastMsg = 3,
	M_DestroyMsg = 4,
	M_DropItem = 5,
	M_PickupItem = 6,
	M_RequestInventory = 7,
	M_Inventory = 8,
	M_TargetData = 9,
	M_RequestParameters = 10,
	M_Parameters = 11,
	M_Chat = 12,
	M_ChatPost = 13,
	M_Replica = 14,
	___ = 0;

function Net(url) {
}

Net.prototype = Object.create(EventEmitter.prototype);
Net.prototype.constructor = Net;

Net.prototype.connecTo = function(url) {
	if (this.ws) {
		this.ws.close();
	}

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
				if (message.hasOwnProperty('T')) {
					that._ParseMessages(message.T | 0, message.V, event);
				}
				break;
			default:
				that.emit('message', message, event);
		}
	};
};

Net.prototype.close = function() {
	this.ws.close();
};
Net.prototype.send = function(message) {
	var ws = this.ws;
	if (ws.readyState === WebSocket.OPEN) {
		ws.send(CBOR.encode(message));
	}
};

/*
 * MESSAGES
 */

Net.prototype._ParseMessages = function(type, value, event) {
	switch (type) {
		case M_SetVelocityMsg:
			this.emit('SetVelocityMsg', value);
			break;
		case M_SetTargetMsg:
			this.emit('SetTargetMsg', value);
			break;
		case M_CastMsg:
			this.emit('FireMsg', value);
			break;
		case M_DestroyMsg:
			this.emit('DestroyMsg', value);
			break;
		case M_TargetData:
			this.emit('TargetDataMsg', value);
			break;
		case M_Inventory:
			this.emit('InventoryMsg', value);
			break;
		case M_Parameters:
			this.emit('ParametersMsg', value);
			break;
		case M_Chat:
			this.emit('ChatMsg', value);
			break;
		case M_Replica:
			this.emit('ReplicaMsg', value);
			break;
		default:
			this.emit('event', type, value, event);
	}
};

Net.prototype.SetVelocityMsg = function(data) {
	this.send({
		T: M_SetVelocityMsg,
		V: data
	});
};
Net.prototype.SetTargetMsg = function(id) {
	this.send({
		T: M_SetTargetMsg,
		V: {
			id: id
		},
	});
};
Net.prototype.FireMsg = function(name, to) {
	this.send({
		T: M_CastMsg,
		V: {
			s: name,
			t: to,
		}
	});
};
Net.prototype.RequestInventoryMsg = function() {
	this.send({
		T: M_RequestInventory,
		V: {}
	});
};
Net.prototype.RequestParametersMsg = function() {
	this.send({
		T: M_RequestParameters,
		V: {}
	});
};
Net.prototype.PickupItemMsg = function(id) {
	this.send({
		T: M_PickupItem,
		V: {
			t: id
		}
	});
};
Net.prototype.DropItemMsg = function(index) {
	this.send({
		T: M_DropItem,
		V: {
			Id: index
		}
	});
};

Net.prototype.ChatPostMsg = function(msg) {
	this.send({
		T: M_ChatPost,
		V: {
			m: msg
		}
	});
};

module.exports = Net;
