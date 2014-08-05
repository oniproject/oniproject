'use strict';

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
				add = add.translate(mod.x, mod.y, mod.z);
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
			//add = Isomer.Shape.Prism(Isomer.Point.ORIGIN, obj.dx, obj.dy, obj.dz);
			add = Isomer.Shape.Prism(Isomer.Point.ORIGIN, 1,1,1);
			//add = add.translate(pos[0], pos[1], pos[2]);
			//add = add.scale(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
			break;
		case 'pyramid':
			var pos = obj.pos;
			add = Isomer.Shape.Pyramid(Isomer.Point.ORIGIN, 1,1,1);
			//add = add.translate(pos[0], pos[1], pos[2]);
			//add = add.scale(Isomer.Point.apply(null, pos), obj.dx, obj.dy, obj.dz);
			break;
		case 'cylinder':
			var pos = obj.pos;
			add = Isomer.Shape.Cylinder(Isomer.Point.ORIGIN, 1, obj.vertices, 1);
			//add = add.translate(pos[0], pos[1], pos[2]);
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
		if(obj.pos !== undefined) {
			var pos = obj.pos;
			var point = Isomer.Point.apply(null, pos);
			add = add.translate(pos[0], pos[1], pos[2]);
			if(obj.size !== undefined) {
				add = add.scale(point, obj.size[0], obj.size[1], obj.size[2]);
			}
			if(obj.yaw !== undefined) {
				add = add.rotateZ(point, obj.yaw * (Math.PI / 180));
			}
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
