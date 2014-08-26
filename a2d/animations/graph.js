
    /*this.curves = []; // dfx, dfy, ddfx, ddfy, dddfx, dddfy, ...
    this.curves.length = (frameCount - 1) * 6;
};
spine.Curves.prototype = {
    setLinear: function (frameIndex) {
        this.curves[frameIndex * 6] = 0/ LINEAR /;
    },
    setStepped: function (frameIndex) {
        this.curves[frameIndex * 6] = -1/ STEPPED /;
    },
*/
//0.416, 1.15, 0.494, 1.27

module.exports = {
	id: 'graph',
	ctx: null,
	canvas: null,
	methods: {
		redraw: function() {
			var canvas = this.$options.canvas;
			var ctx = this.$options.ctx;
			ctx.setTransform(1, 0, 0, 1, 0, 0);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.translate(0, canvas.height - 20);
			ctx.scale(canvas.width, -100);

			//ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.lineWidth = 0.004;

			// h
			ctx.beginPath();
			ctx.strokeStyle = '#333333';
			var n = 0.33/2;
			for(var i=0; i<7; i++) {
				ctx.moveTo(-2, n*i);
				ctx.lineTo(2, n*i);
			}
			ctx.stroke();

			ctx.translate(0.1, 0);
			ctx.scale(0.8, 1);


			// v
			ctx.beginPath();
			ctx.strokeStyle = '#333333';
			var n = 0.30/4;
			for(var i=0; i<14; i++) {
				ctx.moveTo(n*i, -2);
				ctx.lineTo(n*i, 2);
			}
			ctx.stroke();

			// path
			ctx.strokeStyle = '#00ff00';
			ctx.beginPath();
			ctx.moveTo(0, 0);
			switch(this.type) {
			case 'bezier':
				ctx.bezierCurveTo(
					this.cx1, this.cy1,
					this.cx2, this.cy2,
					1,1
				);
				ctx.moveTo(0, 0);
				ctx.lineTo(this.cx1,this.cy1);
				ctx.moveTo(1, 1);
				ctx.lineTo(this.cx2,this.cy2);
				ctx.lineWidth = 0.006;
				ctx.rect(0-ctx.lineWidth, 0-ctx.lineWidth, ctx.lineWidth*2, ctx.lineWidth*2);
				ctx.rect(1-ctx.lineWidth, 1-ctx.lineWidth, ctx.lineWidth*2, ctx.lineWidth*2);
				ctx.rect(this.cx1-ctx.lineWidth, this.cy1-ctx.lineWidth, ctx.lineWidth*2, ctx.lineWidth*2);
				ctx.rect(this.cx2-ctx.lineWidth, this.cy2-ctx.lineWidth, ctx.lineWidth*2, ctx.lineWidth*2);
				break;
			case 'linear':
				ctx.lineTo(1,1);
				break;
			case 'stepped':
				ctx.lineTo(1,0);
				ctx.lineTo(1,1);
				break;
			}
			ctx.stroke();
		},
	},
	attached: function() {
		var canvas = document.getElementById('graph-canvas');
		var ctx = canvas.getContext("2d");
		//ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.$options.canvas = canvas;
		this.$options.ctx = ctx;

		var that = this;
		this.$on('updateCurve', function(curve, d){
			that.type = curve.type;
			that.cx1 = curve.cx1;
			that.cx2 = curve.cx2;
			that.cy1 = curve.cy1;
			that.cy2 = curve.cy2;

			that.redraw();
		});
		this.redraw();
	},
	template: require('./graph.html'),
	data: {
		// linear, bezier, stepped
		type: 'bezier',
		cx1: 0.416, cy1: 1.15,
		cx2: 0.494, cy2: 1.27,
	},
}

