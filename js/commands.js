'use strict';

function Delete(id) {
	var obj;
	this.redo = function(map) {
		obj = map.objects.splice(id, 1);
	};
	this.undo = function(map) {
		var left = map.objects.slice(0, id);
		var right = map.objects.slice(id);
		map.objects = [].concat(left, obj, right)
	};
}

function AddPrism(pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'prism',
			pos:  pos     || [0,0,0],
			size: size    || [1,1,1],
			yaw: 0,
			color:color   || [0,0,0,0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddPyramid(pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'pyramid',
			pos:  pos     || [0,0,0],
			size: size    || [1,1,1],
			yaw: 0,
			color: color  || [0,0,0,0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddCylinder(pos, size, vertices, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'cylinder',
			pos:  pos     || [0,0,0],
			size: size    || [1,1,1],
			yaw: 0,
			vertices: vertices || 30,
			color: color  || [0,0,0,0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddPath(path, pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'path',
			path: path,
			pos:  pos     || [0,0,0],
			size: size    || [1,1,1],
			yaw: 0,
			color: color  || [0,0,0,0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function AddShape(path, height, pos, size, color) {
	this.redo = function(map) {
		map.objects.push({
			type: 'shape',
			path: path,
			height: height,
			pos:  pos     || [0,0,0],
			size: size    || [1,1,1],
			yaw: 0,
			color: color  || [0,0,0,0],
			modificators: [],
		});
	};
	this.undo = function(map) {
		map.objects.pop();
	};
}

function SetColor(id, color) {
	var old;
	this.redo = function(map) {
		var obj = map.objects[id];
		old = obj.color;
		obj.color = color;
	};
	this.undo = function(map) {
		var obj = map.objects[id];
		obj.color = old;
	};
}

function Resize(id, size, vertices) {
	var old;
	var old_vertices;
	this.redo = function(map) {
		var obj = map.objects[id];
		if(obj.size !== undefined) {
			old = obj.size;
			obj.size = size;
		}
		if(obj.vertices !== undefined) {
			old_vertices = obj.vertices;
			obj.vertices = vertices;
		}
	};
	this.undo = function(map) {
		var obj = map.objects[id];
		if(obj.size !== undefined) {
			obj.size = old;
		}
		if(obj.vertices !== undefined) {
			obj.vertices = old_vertices;
		}
	};
}

function Rotate(id, yaw) {
	var old;
	this.redo = function(map) {
		var obj = map.objects[id];
		old = obj.yaw;
		obj.yaw = yaw;
	};
	this.undo = function(map) {
		var obj = map.objects[id];
		obj.yaw = old;
	};
}

function Move(id, pos) {
	var old;
	this.redo = function(map) {
		var obj = map.objects[id];
		old = obj.pos;
		obj.pos = pos;
	};
	this.undo = function(map) {
		map.objects[id].pos = old;
	};
}

function Modificator(id, mod) {
	this.redo = function(map) {
		map.objects[id].modificators.push(mod);
	};
	this.undo = function(map) {
		map.objects[id].modificators.pop();
	};
}


module.exports = {
	Delete: Delete,
	AddPrism: AddPrism,
	AddPyramid: AddPyramid,
	AddCylinder: AddCylinder,
	AddPath: AddPath,
	AddShape: AddShape,

	SetColor: SetColor,
	Resize: Resize,
	Rotate: Rotate,
	Move: Move,
	Modificator: Modificator,
};
