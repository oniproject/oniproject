'use strict';

var Tileset = require('./tileset');
var TileLayer = require('./tilelayer');
var ObjectGroup = require('./objectgroup');
var ImageLayer = require('./imagelayer');

function Tiled(path, uri) {
	PIXI.DisplayObjectContainer.call(this);

	this.path = path

	var loader = this.loader = new PIXI.JsonLoader(path + uri);

	this.tilesets = [];
	this.layers = [];
}

Tiled.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);
Tiled.constructor = Tiled;

Tiled.prototype.load = function(fn, fn2) {
	var that = this;
	this.loader.on('loaded', function() {
		var json = that.data = that.loader.json;

		var tilesets_count = json.tilesets.length;
		for (var i = 0, l = json.tilesets.length; i < l; i++) {
			var t = new Tileset(json.tilesets[i], that.path, null, null)
			that.tilesets.push(t);

			t.load(function() {
				tilesets_count--;
				if (!tilesets_count) {
					console.info('tilesets loaded');
					if (fn) {
						fn();
					}
				}
			});
		}

		for (var i = 0, l = json.layers.length; i < l; i++) {
			var layer = json.layers[i];
			var obj = undefined;
			switch (layer.type) {
				case 'tilelayer':
					obj = new TileLayer(layer, that.tilesets, json.tilewidth, json.tileheight, json.renderorder);
					break;
				case 'objectgroup':
					obj = new ObjectGroup(layer, that.tilesets);
					break;
				case 'imagelayer':
					obj = new ImageLayer(layer, that.path);
					obj.load();
					break;
			}
			if (obj !== undefined) {
				console.log('addChild', layer, obj);
				that.layers.push(obj);
				that.addChild(obj);
			}
		}
		if (fn2) {
			fn2();
		}

	});
	this.loader.load();
}

module.exports = Tiled;
