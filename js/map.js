"use strict";

var Isomer = require('isomer');

function Map(iso) {
	this.iso = iso;
	this.objects = [];

	var mod = function(add, obj) {
		for(var i=0, l=obj.modificators.length; i<l; i++) {
			var mod = obj.modificators[i];
			var point = Isomer.Point.apply(null, mod.point);

			switch(mod.type) {
			case 'rotateZ':
				add = add.rotateZ(point, mod.yaw);
				break;
			case 'scale':
				add = add.scale(point, mod.x, mod.y, mod.z);
				break;
			case 'translate':
				add = add.translate(point, mod.x, mod.y, mod.z);
				break;
			default:
				console.warn('fail mod.type', mod);
			}
		}
		return add;
	};
	this._render_one = function(obj) {
		var add = null;

		switch(obj.type) {
		case 'prism':
			var pos = obj.pos;
			add = Isomer.Shape.Prism(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
			break;
		case 'pyramid':
			var pos = obj.pos;
			add = Isomer.Shape.Pyramid(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
			break;
		case 'cylinder':
			var pos = obj.pos;
			add = Isomer.Shape.Cylinder(Isomer.Point.apply(null, pos), obj.radius, obj.vertices, obj.height);
			break;
		case 'path':
			add = new Isomer.Path(obj.path.map(function(el) {
				return Isomer.Point.apply(null, el);
			}));
			break;
		case 'shape':
			add = Isomer.Shape.extrude(new Isomer.Path(obj.path.map(function(el) {
				return Isomer.Point.apply(null, el);
			})), obj.height);
			break;
		default:
			console.warn('fail obj.type', obj);
		}

		return (add && mod(add, obj)) || null;
	}

	this.render = function() {
		for (var i=0, l=this.objects.length; i<l; i++) {
			var obj = this.objects[i];
			var add = this._render_one(obj);

			var color = new Isomer.Color(obj.color[0], obj.color[1], obj.color[2], obj.color[3]);
			add && this.iso.add(add, color);
		}
	};
}

module.exports = Map;
