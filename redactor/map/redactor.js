'use strict';

var commands = require('./commands'),
	saveAs = require('filesaver.js');


function Redactor(map) {
	this.commands = [];
	this.current = 0;
	this.map = map;
	this.active = -1;

	var that = this;


	$.UIkit.notify({
		message: 'Hello Kitty!',
		status: 'info',
		timeout: 5000,
		pos: 'top-center'
	});

	this._initUI();

	this.objList = new Vue(require('./obj-list')(that));
	this.objList.$on('setActive', function(id) {
		that.active = id;
	});
	this.setActive = function(id) {
		that.active = id;
		that.objList.setActive(id);
	}

	this.syncList = function() {
		this.objList.list = that.map.objects;
	};

	this.syncList();

	var msgSuccess = {
		pos: 'top-right',
		timeout: 150,
		status: 'success'
	},
	msgDanger = {
		pos: 'top-right',
		timeout: 150,
		status: 'danger'
	};
	$('#undo').click(function(event) {
		event.preventDefault();
		if (that.undo(1)) {
			$.UIkit.notify('undo', msgSuccess);
		} else {
			$.UIkit.notify('undo empty', msgDanger);
		}
	});
	$('#redo').click(function(event) {
		event.preventDefault();
		if (that.redo(1)) {
			$.UIkit.notify('redo', msgSuccess);
		} else {
			$.UIkit.notify('redo empty', msgDanger);
		}
	});

}

Redactor.prototype._initUI = function() {
	var that = this;

	$('#download').click(function() {
		var blob = new Blob([JSON.stringify({
			objects: that.map.objects
		})], {
			type: 'text/json;charset=utf-8'
		});
		saveAs(blob, 'map.json');
	});

	function handleFileSelect(event) {
		event.stopPropagation();
		event.preventDefault();

		var files = event.dataTransfer.files,
			f = files[0];
		console.log(f.name, f.size, f.lastModifiedDate);

		var reader = new FileReader();
		reader.onload = function(e) {
			that.map.objects = JSON.parse(e.target.result).objects;
		};
		reader.readAsText(f);

		$('#UploadModal a.uk-close').click();
	}

	function handleDragOver(event) {
		event.stopPropagation();
		event.preventDefault();
		event.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
		$('#upload-drop').addClass('uk-dragover');
	}

	function handleDragLeave(event) {
		$('#upload-drop').removeClass('uk-dragover');
	}

	// Setup the dnd listeners.
	var dropZone = document.getElementById('upload-drop');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('dragleave', handleDragLeave, false);
	dropZone.addEventListener('drop', handleFileSelect, false);

	this.Tools = new Vue(require('./tools')(that));

	new Vue(require('./modals/prism')(that));
	new Vue(require('./modals/pyramid')(that));
	new Vue(require('./modals/cylinder')(that));
	new Vue(require('./modals/shape')(that));
	new Vue(require('./modals/path')(that));
}

module.exports = Redactor;
