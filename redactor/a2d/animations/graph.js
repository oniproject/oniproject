
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
	components: {
		svg: {
			data: {
				//p1: {x: 20,  y: 200-30},
				//p2: {x: 350-20, y: 30},
				c1: {
					x: 100,
					y: 30
				},
				c2: {
					x: 200,
					y: 70
				},
				dPoint: {
					x: 0,
					y: 0
				},
				isDrag: '',
				// offsets
				left: 20,
				right: 40,
				top: 60,
				bottom: 30,
			},
			methods: {
				drag: function(event) {
					event.preventDefault();
					this.dPoint.x = event.pageX;
					this.dPoint.y = event.pageY;
					this.isDrag = event.target.id;
				},
				move: function(event) {
					event.preventDefault();
					var id = this.isDrag;
					if (!this.$data[id]) return;
					this.$data[id].x += event.pageX - this.dPoint.x;
					this.$data[id].y += event.pageY - this.dPoint.y;
					if (this.$data[id].x < this.left) {
						this.$data[id].x = this.left;
					}
					if (this.$data[id].x > this.w - this.right) {
						this.$data[id].x = this.w - this.right;
					}
					this.dPoint.x = event.pageX;
					this.dPoint.y = event.pageY;
				},
				fromPoints: function(x1, y1, x2, y2) {
					console.log(x1, y1, x2, y2);
					this.x1 = x1;
					this.y1 = y1;
					this.x2 = x2;
					this.y2 = y2;
				},
			},
			computed: {
				p1: function() {
					return {
						x: this.left,
						y: this.h - this.bottom
					};
				},
				p2: function() {
					return {
						x: this.w - this.right,
						y: this.top
					};
				},
				w: function() {
					return parseFloat(window.getComputedStyle(this.$el, null).getPropertyValue('width'));
				},
				h: function() {
					return parseFloat(window.getComputedStyle(this.$el, null).getPropertyValue('height'));
				},
				x1: {
					$get: function() {
						return (this.c1.x - 20) / (this.w - 20 * 2);
					},
					$set: function(val) {
						this.c1.x = val * (this.w - 20 * 2) + 20;
					},
				},
				x2: {
					$get: function() {
						return (this.c2.x - 20) / (this.w - 20 * 2);
					},
					$set: function(val) {
						this.c2.x = val * (this.w - 20 * 2) + 20;
					},
				},
				y1: {
					$get: function() {
						return -(this.c1.y - this.h + this.bottom) / (this.h - this.bottom - this.top);
					},
					$set: function(val) {
						this.c1.y = this.h - val * (this.h - this.bottom - this.top) - this.bottom;
					},
				},
				y2: {
					$get: function() {
						return -(this.c2.y - this.h + this.bottom) / (this.h - this.bottom - this.top);
					},
					$set: function(val) {
						this.c2.y = this.h - val * (this.h - this.bottom - this.top) - this.bottom;
					},
				},
			},
		},
	},
	methods: {
		redraw: function() {
			this.$.svg.fromPoints(this.cx1, this.cy1, this.cx2, this.cy2);
		},
	},
	attached: function() {
		var that = this;
		this.$on('updateCurve', function(curve, d) {
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
		cx1: 0.416,
		cy1: 1.15,
		cx2: 0.494,
		cy2: 1.27,
	},
}
