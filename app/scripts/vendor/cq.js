/*
	Canvas Query 0.9.0
	http://canvasquery.com
	(c) 2012-2013 http://rezoner.net
	Canvas Query may be freely distributed under the MIT license.
*/

(function(window, undefined) {
	'use strict';
	var MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent);


	window.requestAnimationFrame = (function() {
		return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
			window.setTimeout(callback, 1000 / 60);
		};
	})();


	var $ = function(selector) {
		if (arguments.length === 0) {
			var canvas = $.createCanvas(window.innerWidth, window.innerHeight);
			window.addEventListener("resize", function() {
				// canvas.width = window.innerWidth;
				// canvas.height = window.innerHeight;
			});
		} else if (typeof selector === "string") {
			var canvas = document.querySelector(selector);
		} else if (typeof selector === "number") {
			var canvas = $.createCanvas(arguments[0], arguments[1]);
		} else if (selector instanceof Image || selector instanceof HTMLImageElement) {
			var canvas = $.createCanvas(selector);
		} else if (selector instanceof $.Wrapper) {
			return selector;
		} else {
			var canvas = selector;
		}

		return new $.Wrapper(canvas);
	}

	$.extend = function() {
		for (var i = 1; i < arguments.length; i++) {
			for (var j in arguments[i]) {
				arguments[0][j] = arguments[i][j];
			}
		}

		return arguments[0];
	};

	$.augment = function() {
		for (var i = 1; i < arguments.length; i++) {
			_.extend(arguments[0], arguments[i]);
			arguments[i](arguments[0]);
		}
	};

	$.distance = function(x1, y1, x2, y2) {
		if (arguments.length > 2) {
			var dx = x1 - x2;
			var dy = y1 - y2;

			return Math.sqrt(dx * dx + dy * dy);
		} else {
			return Math.abs(x1 - y1);
		}
	};

	$.extend($, {

		keycodes: {
			37: "left",
			38: "up",
			39: "right",
			40: "down",
			45: "insert",
			46: "delete",
			8: "backspace",
			9: "tab",
			13: "enter",
			16: "shift",
			17: "ctrl",
			18: "alt",
			19: "pause",
			20: "capslock",
			27: "escape",
			32: "space",
			33: "pageup",
			34: "pagedown",
			35: "end",
			112: "f1",
			113: "f2",
			114: "f3",
			115: "f4",
			116: "f5",
			117: "f6",
			118: "f7",
			119: "f8",
			120: "f9",
			121: "f10",
			122: "f11",
			123: "f12",
			144: "numlock",
			145: "scrolllock",
			186: "semicolon",
			187: "equal",
			188: "comma",
			189: "dash",
			190: "period",
			191: "slash",
			192: "graveaccent",
			219: "openbracket",
			220: "backslash",
			221: "closebraket",
			222: "singlequote"
		},

		cleanArray: function(array, property) {

			var lastArgument = arguments[arguments.length - 1];
			var isLastArgumentFunction = typeof lastArgument === "function";

			for (var i = 0, len = array.length; i < len; i++) {
				if (array[i] === null || (property && array[i][property])) {
					if (isLastArgumentFunction) {
						lastArgument(array[i]);
					}
					array.splice(i--, 1);
					len--;
				}
			}
		},

		specialBlendFunctions: ["color", "value", "hue", "saturation"],

		blendFunctions: {
			normal: function(a, b) {
				return b;
			},

			overlay: function(a, b) {
				a /= 255;
				b /= 255;
				var result = 0;

				if (a < 0.5) result = 2 * a * b;
				else result = 1 - 2 * (1 - a) * (1 - b);

				return Math.min(255, Math.max(0, result * 255 | 0));
			},

			hardLight: function(a, b) {
				return $.blendFunctions.overlay(b, a);
			},

			softLight: function(a, b) {
				a /= 255;
				b /= 255;

				var v = (1 - 2 * b) * (a * a) + 2 * b * a;
				return $.limitValue(v * 255, 0, 255);
			},

			dodge: function(a, b) {
				return Math.min(256 * a / (255 - b + 1), 255);
			},

			burn: function(a, b) {
				return 255 - Math.min(256 * (255 - a) / (b + 1), 255);
			},

			multiply: function(a, b) {
				return b * a / 255;
			},

			divide: function(a, b) {
				return Math.min(256 * a / (b + 1), 255);
			},

			screen: function(a, b) {
				return 255 - (255 - b) * (255 - a) / 255;
			},

			grainExtract: function(a, b) {
				return $.limitValue(a - b + 128, 0, 255);
			},

			grainMerge: function(a, b) {
				return $.limitValue(a + b - 128, 0, 255);
			},

			difference: function(a, b) {
				return Math.abs(a - b);
			},

			addition: function(a, b) {
				return Math.min(a + b, 255);
			},

			substract: function(a, b) {
				return Math.max(a - b, 0);
			},

			darkenOnly: function(a, b) {
				return Math.min(a, b);
			},

			lightenOnly: function(a, b) {
				return Math.max(a, b);
			},

			color: function(a, b) {
				var aHSL = $.rgbToHsl(a);
				var bHSL = $.rgbToHsl(b);

				return $.hslToRgb(bHSL[0], bHSL[1], aHSL[2]);
			},

			hue: function(a, b) {
				var aHSV = $.rgbToHsv(a);
				var bHSV = $.rgbToHsv(b);

				if (!bHSV[1]) return $.hsvToRgb(aHSV[0], aHSV[1], aHSV[2]);
				else return $.hsvToRgb(bHSV[0], aHSV[1], aHSV[2]);
			},

			value: function(a, b) {
				var aHSV = $.rgbToHsv(a);
				var bHSV = $.rgbToHsv(b);

				return $.hsvToRgb(aHSV[0], aHSV[1], bHSV[2]);
			},

			saturation: function(a, b) {
				var aHSV = $.rgbToHsv(a);
				var bHSV = $.rgbToHsv(b);

				return $.hsvToRgb(aHSV[0], bHSV[1], aHSV[2]);
			}
		},

		blend: function(below, above, mode, mix) {
			if (typeof mix === "undefined") mix = 1;

			var below = $(below);
			var above = $(above);

			var belowCtx = below.context;
			var aboveCtx = above.context;

			var belowData = belowCtx.getImageData(0, 0, below.canvas.width, below.canvas.height);
			var aboveData = aboveCtx.getImageData(0, 0, above.canvas.width, above.canvas.height);

			var belowPixels = belowData.data;
			var abovePixels = aboveData.data;

			var imageData = this.createImageData(below.canvas.width, below.canvas.height);
			var pixels = imageData.data;

			var blendingFunction = $.blendFunctions[mode];

			if ($.specialBlendFunctions.indexOf(mode) !== -1) {
				for (var i = 0, len = belowPixels.length; i < len; i += 4) {
					var rgb = blendingFunction([belowPixels[i + 0], belowPixels[i + 1], belowPixels[i + 2]], [abovePixels[i + 0], abovePixels[i + 1], abovePixels[i + 2]]);

					pixels[i + 0] = belowPixels[i + 0] + (rgb[0] - belowPixels[i + 0]) * mix;
					pixels[i + 1] = belowPixels[i + 1] + (rgb[1] - belowPixels[i + 1]) * mix;
					pixels[i + 2] = belowPixels[i + 2] + (rgb[2] - belowPixels[i + 2]) * mix;

					pixels[i + 3] = belowPixels[i + 3];
				}
			} else {

				for (var i = 0, len = belowPixels.length; i < len; i += 4) {
					var r = blendingFunction(belowPixels[i + 0], abovePixels[i + 0]);
					var g = blendingFunction(belowPixels[i + 1], abovePixels[i + 1]);
					var b = blendingFunction(belowPixels[i + 2], abovePixels[i + 2]);

					pixels[i + 0] = belowPixels[i + 0] + (r - belowPixels[i + 0]) * mix;
					pixels[i + 1] = belowPixels[i + 1] + (g - belowPixels[i + 1]) * mix;
					pixels[i + 2] = belowPixels[i + 2] + (b - belowPixels[i + 2]) * mix;

					pixels[i + 3] = belowPixels[i + 3];
				}
			}

			below.context.putImageData(imageData, 0, 0);

			return below;
		},

		wrapValue: function(value, min, max) {
			var d = Math.abs(max - min);
			return min + (value - min) % d;
		},

		limitValue: function(value, min, max) {
			return value < min ? min : value > max ? max : value;
		},

		mix: function(a, b, ammount) {
			return a + (b - a) * ammount;
		},

		hexToRgb: function(hex) {
			if (hex.length === 7) return ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
			else return ['0x' + hex[1] | 0, '0x' + hex[2], '0x' + hex[3] | 0];
		},

		rgbToHex: function(r, g, b) {
			return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7);
		},

		/* author: http://mjijackson.com/ */

		rgbToHsl: function(r, g, b) {

			if (r instanceof Array) {
				b = r[2];
				g = r[1];
				r = r[0];
			}

			r /= 255, g /= 255, b /= 255;
			var max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			var h, s, l = (max + min) / 2;

			if (max == min) {
				h = s = 0; // achromatic
			} else {
				var d = max - min;
				s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}

			return [h, s, l];
		},

		/* author: http://mjijackson.com/ */

		hslToRgb: function(h, s, l) {
			var r, g, b;

			if (s == 0) {
				r = g = b = l; // achromatic
			} else {
				function hue2rgb(p, q, t) {
					if (t < 0) t += 1;
					if (t > 1) t -= 1;
					if (t < 1 / 6) return p + (q - p) * 6 * t;
					if (t < 1 / 2) return q;
					if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
					return p;
				}

				var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
				var p = 2 * l - q;
				r = hue2rgb(p, q, h + 1 / 3);
				g = hue2rgb(p, q, h);
				b = hue2rgb(p, q, h - 1 / 3);
			}

			return [r * 255 | 0, g * 255 | 0, b * 255 | 0];
		},

		rgbToHsv: function(r, g, b) {
			if (r instanceof Array) {
				b = r[2];
				g = r[1];
				r = r[0];
			}

			r = r / 255, g = g / 255, b = b / 255;
			var max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			var h, s, v = max;

			var d = max - min;
			s = max == 0 ? 0 : d / max;

			if (max == min) {
				h = 0; // achromatic
			} else {
				switch (max) {
					case r:
						h = (g - b) / d + (g < b ? 6 : 0);
						break;
					case g:
						h = (b - r) / d + 2;
						break;
					case b:
						h = (r - g) / d + 4;
						break;
				}
				h /= 6;
			}

			return [h, s, v];
		},

		hsvToRgb: function(h, s, v) {
			var r, g, b;

			var i = Math.floor(h * 6);
			var f = h * 6 - i;
			var p = v * (1 - s);
			var q = v * (1 - f * s);
			var t = v * (1 - (1 - f) * s);

			switch (i % 6) {
				case 0:
					r = v, g = t, b = p;
					break;
				case 1:
					r = q, g = v, b = p;
					break;
				case 2:
					r = p, g = v, b = t;
					break;
				case 3:
					r = p, g = q, b = v;
					break;
				case 4:
					r = t, g = p, b = v;
					break;
				case 5:
					r = v, g = p, b = q;
					break;
			}

			return [r * 255 | 0, g * 255 | 0, b * 255 | 0];
		},

		color: function() {
			var result = new $.Color();
			result.parse(arguments[0], arguments[1]);
			return result;
		},

		createCanvas: function(width, height) {
			var result = document.createElement("canvas");

			if (arguments[0] instanceof Image || arguments[0] instanceof HTMLImageElement) {
				var image = arguments[0];
				result.width = image.width;
				result.height = image.height;
				result.getContext("2d").drawImage(image, 0, 0);
			} else {
				result.width = width;
				result.height = height;
			}

			return result;
		},

		createImageData: function(width, height) {
			return document.createElement("Canvas").getContext("2d").createImageData(width, height);
		},


		/* https://gist.github.com/3781251 */

		mousePosition: function(event) {
			var totalOffsetX = 0,
				totalOffsetY = 0,
				coordX = 0,
				coordY = 0,
				currentElement = event.target || event.srcElement,
				mouseX = 0,
				mouseY = 0;

			// Traversing the parents to get the total offset
			do {
				totalOffsetX += currentElement.offsetLeft;
				totalOffsetY += currentElement.offsetTop;
			}
			while ((currentElement = currentElement.offsetParent));
			// Set the event to first touch if using touch-input
			if (event.changedTouches && event.changedTouches[0] !== undefined) {
				event = event.changedTouches[0];
			}
			// Use pageX to get the mouse coordinates
			if (event.pageX || event.pageY) {
				mouseX = event.pageX;
				mouseY = event.pageY;
			}
			// IE8 and below doesn't support event.pageX
			else if (event.clientX || event.clientY) {
				mouseX = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
				mouseY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
			}
			// Subtract the offset from the mouse coordinates
			coordX = mouseX - totalOffsetX;
			coordY = mouseY - totalOffsetY;

			return {
				x: coordX,
				y: coordY
			};
		}
	});

	$.Wrapper = function(canvas) {
		this.context = canvas.getContext("2d");
		this.canvas = canvas;
	}

	$.Wrapper.prototype = {
		appendTo: function(selector) {
			if (typeof selector === "object") {
				var element = selector;
			} else {
				var element = document.querySelector(selector);
			}

			element.appendChild(this.canvas);

			return this;
		},

		blendOn: function(what, mode, mix) {
			$.blend(what, this, mode, mix);

			return this;
		},

		blend: function(what, mode, mix) {
			if (typeof what === "string") {
				var color = what;
				what = $($.createCanvas(this.canvas.width, this.canvas.height));
				what.fillStyle(color).fillRect(0, 0, this.canvas.width, this.canvas.height);
			}

			$.blend(this, what, mode, mix);

			return this;
		},

		circle: function(x, y, r) {
			this.context.arc(x, y, r, 0, Math.PI * 2);
			return this;
		},

		crop: function(x, y, w, h) {

			var canvas = $.createCanvas(w, h);
			var context = canvas.getContext("2d");

			context.drawImage(this.canvas, x, y, w, h, 0, 0, w, h);
			this.canvas.width = w;
			this.canvas.height = h;
			this.clear();
			this.context.drawImage(canvas, 0, 0);

			return this;
		},

		set: function(properties) {
			$.extend(this.context, properties);

			/*      for(var key in properties) {
				this[key](properties[key]);
			}
			*/

		},

		resize: function(width, height) {
			var w = width,
				h = height;

			if (arguments.length === 1) {
				w = arguments[0] * this.canvas.width | 0;
				h = arguments[0] * this.canvas.height | 0;
			} else {

				if (height === null) {
					if (this.canvas.width > width) {
						h = this.canvas.height * (width / this.canvas.width) | 0;
						w = width;
					} else {
						w = this.canvas.width;
						h = this.canvas.height;
					}
				} else if (width === null) {
					if (this.canvas.width > width) {
						w = this.canvas.width * (height / this.canvas.height) | 0;
						h = height;
					} else {
						w = this.canvas.width;
						h = this.canvas.height;
					}
				}
			}

			var $resized = $(w, h).drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, w, h);
			this.canvas = $resized.canvas;
			this.context = $resized.context;

			return this;
		},


		trim: function(color, changes) {
			var transparent;

			if (color) {
				color = $.color(color).toArray();
				transparent = !color[3];
			} else transparent = true;

			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;

			var bound = [this.canvas.width, this.canvas.height, 0, 0];

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				if (transparent) {
					if (!sourcePixels[i + 3]) continue;
				} else if (sourcePixels[i + 0] === color[0] && sourcePixels[i + 1] === color[1] && sourcePixels[i + 2] === color[2]) continue;
				var x = (i / 4 | 0) % this.canvas.width | 0;
				var y = (i / 4 | 0) / this.canvas.width | 0;

				if (x < bound[0]) bound[0] = x;
				if (x > bound[2]) bound[2] = x;

				if (y < bound[1]) bound[1] = y;
				if (y > bound[3]) bound[3] = y;
			}

			if (bound[2] === 0 || bound[3] === 0) {

			} else {
				if (changes) {
					changes.left = bound[0];
					changes.top = bound[1];
					changes.width = bound[2] - bound[0];
					changes.height = bound[3] - bound[1];
				}

				this.crop(bound[0], bound[1], bound[2] - bound[0] + 1, bound[3] - bound[1] + 1);
			}

			return this;
		},

		resizePixel: function(pixelSize) {

			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;
			var canvas = document.createElement("canvas");
			var context = canvas.context = canvas.getContext("2d");

			canvas.width = this.canvas.width * pixelSize | 0;
			canvas.height = this.canvas.height * pixelSize | 0;

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				if (!sourcePixels[i + 3]) continue;
				context.fillStyle = $.rgbToHex(sourcePixels[i + 0], sourcePixels[i + 1], sourcePixels[i + 2]);

				var x = (i / 4) % this.canvas.width;
				var y = (i / 4) / this.canvas.width | 0;

				context.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
			}

			this.canvas.width = canvas.width;
			this.canvas.height = canvas.height;
			this.clear().drawImage(canvas, 0, 0);

			return this;

			/* this very clever method is working only under Chrome */

			var x = 0,
				y = 0;

			var canvas = document.createElement("canvas");
			var context = canvas.context = canvas.getContext("2d");

			canvas.width = this.canvas.width * pixelSize | 0;
			canvas.height = this.canvas.height * pixelSize | 0;

			while (x < this.canvas.width) {
				y = 0;
				while (y < this.canvas.height) {
					context.drawImage(this.canvas, x, y, 1, 1, x * pixelSize, y * pixelSize, pixelSize, pixelSize);
					y++;
				}
				x++;
			}

			this.canvas = canvas;
			this.context = context;

			return this;
		},


		matchPalette: function(palette) {
			var imgData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);

			var rgbPalette = [];
			for (var i = 0; i < palette.length; i++) {
				rgbPalette.push($.color(palette[i]));
			}


			for (var i = 0; i < imgData.data.length; i += 4) {
				var difList = [];
				for (var j = 0; j < rgbPalette.length; j++) {
					var rgbVal = rgbPalette[j];
					var rDif = Math.abs(imgData.data[i] - rgbVal[0]),
						gDif = Math.abs(imgData.data[i + 1] - rgbVal[1]),
						bDif = Math.abs(imgData.data[i + 2] - rgbVal[2]);
					difList.push(rDif + gDif + bDif);
				}

				var closestMatch = 0;
				for (var j = 0; j < palette.length; j++) {
					if (difList[j] < difList[closestMatch]) {
						closestMatch = j;
					}
				}

				var paletteRgb = cq.hexToRgb(palette[closestMatch]);
				imgData.data[i] = paletteRgb[0];
				imgData.data[i + 1] = paletteRgb[1];
				imgData.data[i + 2] = paletteRgb[2];
			}

			this.context.putImageData(imgData, 0, 0);

			return this;
		},

		getPalette: function() {
			var palette = [];
			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				if (sourcePixels[i + 3]) {
					var hex = $.rgbToHex(sourcePixels[i + 0], sourcePixels[i + 1], sourcePixels[i + 2]);
					if (palette.indexOf(hex) === -1) palette.push(hex);
				}
			}

			return palette;
		},

		pixelize: function(size) {
			if (!size) return this;
			size = size || 4;

			var mozImageSmoothingEnabled = this.context.mozImageSmoothingEnabled;
			var webkitImageSmoothingEnabled = this.context.webkitImageSmoothingEnabled;

			this.context.mozImageSmoothingEnabled = false;
			this.context.webkitImageSmoothingEnabled = false;

			var scale = (this.canvas.width / size) / this.canvas.width;

			var temp = cq(this.canvas.width, this.canvas.height);

			temp.drawImage(this.canvas, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width * scale | 0, this.canvas.height * scale | 0);
			this.clear().drawImage(temp.canvas, 0, 0, this.canvas.width * scale | 0, this.canvas.height * scale | 0, 0, 0, this.canvas.width, this.canvas.height);

			this.context.mozImageSmoothingEnabled = mozImageSmoothingEnabled;
			this.context.webkitImageSmoothingEnabled = webkitImageSmoothingEnabled;

			return this;
		},

		colorToMask: function(color, inverted) {
			color = $.color(color).toArray();
			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;

			var mask = [];

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				if (sourcePixels[i + 0] == color[0] && sourcePixels[i + 1] == color[1] && sourcePixels[i + 2] == color[2]) mask.push(inverted || false);
				else mask.push(!inverted);
			}

			return mask;
		},

		grayscaleToMask: function(color) {
			color = $.color(color).toArray();
			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;

			var mask = [];

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				mask.push((sourcePixels[i + 0] + sourcePixels[i + 1] + sourcePixels[i + 2]) / 3 | 0);
			}

			return mask;
		},

		grayscaleToAlpha: function() {
			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;

			var mask = [];

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				sourcePixels[i + 3] = (sourcePixels[i + 0] + sourcePixels[i + 1] + sourcePixels[i + 2]) / 3 | 0;

				sourcePixels[i + 0] = sourcePixels[i + 1] = sourcePixels[i + 2] = 255;
			}

			this.context.putImageData(sourceData, 0, 0);

			return this;
		},

		applyMask: function(mask) {
			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;

			var mode = typeof mask[0] === "boolean" ? "bool" : "byte";

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				var value = mask[i / 4];

				if (mode === "bool") sourcePixels[i + 3] = 255 * value | 0;
				else {
					sourcePixels[i + 3] = value | 0;
				}
			}


			this.context.putImageData(sourceData, 0, 0);
			return this;
		},

		fillMask: function(mask) {

			var sourceData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var sourcePixels = sourceData.data;

			var maskType = typeof mask[0] === "boolean" ? "bool" : "byte";
			var colorMode = arguments.length === 2 ? "normal" : "gradient";

			var color = $.color(arguments[1]);
			if (colorMode === "gradient") colorB = $.color(arguments[2]);

			for (var i = 0, len = sourcePixels.length; i < len; i += 4) {
				var value = mask[i / 4];

				if (maskType === "byte") value /= 255;

				if (colorMode === "normal") {
					if (value) {
						sourcePixels[i + 0] = color[0] | 0;
						sourcePixels[i + 1] = color[1] | 0;
						sourcePixels[i + 2] = color[2] | 0;
						sourcePixels[i + 3] = value * 255 | 0;
					}
				} else {
					sourcePixels[i + 0] = color[0] + (colorB[0] - color[0]) * value | 0;
					sourcePixels[i + 1] = color[1] + (colorB[1] - color[1]) * value | 0;
					sourcePixels[i + 2] = color[2] + (colorB[2] - color[2]) * value | 0;
					sourcePixels[i + 3] = 255;
				}
			}

			this.context.putImageData(sourceData, 0, 0);
			return this;
		},

		clear: function(color) {
			if (color) {
				this.context.fillStyle = color;
				this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
			} else {
				this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
			}

			return this;
		},

		clone: function() {
			var result = $.createCanvas(this.canvas.width, this.canvas.height);
			result.getContext("2d").drawImage(this.canvas, 0, 0);
			return $(result);
		},

		fillStyle: function(fillStyle) {
			this.context.fillStyle = fillStyle;
			return this;
		},

		strokeStyle: function(strokeStyle) {
			this.context.strokeStyle = strokeStyle;
			return this;
		},

		gradientText: function(text, x, y, maxWidth, gradient) {

			var words = text.split(" ");

			var h = this.font().match(/\d+/g)[0] * 2;

			var ox = 0;
			var oy = 0;

			if (maxWidth) {
				var line = 0;
				var lines = [""];

				for (var i = 0; i < words.length; i++) {
					var word = words[i] + " ";
					var wordWidth = this.context.measureText(word).width;

					if (ox + wordWidth > maxWidth) {
						lines[++line] = "";
						ox = 0;
					}

					lines[line] += word;

					ox += wordWidth;
				}
			} else var lines = [text];

			for (var i = 0; i < lines.length; i++) {
				var oy = y + i * h * 0.6 | 0;
				var lingrad = this.context.createLinearGradient(0, oy, 0, oy + h * 0.6 | 0);

				for (var j = 0; j < gradient.length; j += 2) {
					lingrad.addColorStop(gradient[j], gradient[j + 1]);
				}

				var text = lines[i];

				this.fillStyle(lingrad).fillText(text, x, oy);
			}

			return this;
		},

		setHsl: function() {

			if (arguments.length === 1) {
				var args = arguments[0];
			} else {
				var args = arguments;
			}

			var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pixels = data.data;
			var r, g, b, a, h, s, l, hsl = [],
				newPixel = [];

			for (var i = 0, len = pixels.length; i < len; i += 4) {
				hsl = $.rgbToHsl(pixels[i + 0], pixels[i + 1], pixels[i + 2]);

				h = args[0] === null ? hsl[0] : $.limitValue(args[0], 0, 1);
				s = args[1] === null ? hsl[1] : $.limitValue(args[1], 0, 1);
				l = args[2] === null ? hsl[2] : $.limitValue(args[2], 0, 1);

				newPixel = $.hslToRgb(h, s, l);

				pixels[i + 0] = newPixel[0];
				pixels[i + 1] = newPixel[1];
				pixels[i + 2] = newPixel[2];
			}

			this.context.putImageData(data, 0, 0);

			return this;
		},

		shiftHsl: function() {

			if (arguments.length === 1) {
				var args = arguments[0];
			} else {
				var args = arguments;
			}

			var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pixels = data.data;
			var r, g, b, a, h, s, l, hsl = [],
				newPixel = [];

			for (var i = 0, len = pixels.length; i < len; i += 4) {
				hsl = $.rgbToHsl(pixels[i + 0], pixels[i + 1], pixels[i + 2]);

				h = args[0] === null ? hsl[0] : $.wrapValue(hsl[0] + args[0], 0, 1);
				s = args[1] === null ? hsl[1] : $.limitValue(hsl[1] + args[1], 0, 1);
				l = args[2] === null ? hsl[2] : $.limitValue(hsl[2] + args[2], 0, 1);

				newPixel = $.hslToRgb(h, s, l);

				pixels[i + 0] = newPixel[0];
				pixels[i + 1] = newPixel[1];
				pixels[i + 2] = newPixel[2];
			}


			this.context.putImageData(data, 0, 0);

			return this;
		},

		replaceHue: function(src, dst) {

			var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pixels = data.data;
			var r, g, b, a, h, s, l, hsl = [],
				newPixel = [];

			for (var i = 0, len = pixels.length; i < len; i += 4) {
				hsl = $.rgbToHsl(pixels[i + 0], pixels[i + 1], pixels[i + 2]);

				if (Math.abs(hsl[0] - src) < 0.05) h = $.wrapValue(dst, 0, 1);
				else h = hsl[0];

				newPixel = $.hslToRgb(h, hsl[1], hsl[2]);

				pixels[i + 0] = newPixel[0];
				pixels[i + 1] = newPixel[1];
				pixels[i + 2] = newPixel[2];
			}

			this.context.putImageData(data, 0, 0);

			return this;
		},

		invert: function(src, dst) {

			var data = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var pixels = data.data;
			var r, g, b, a, h, s, l, hsl = [],
				newPixel = [];

			for (var i = 0, len = pixels.length; i < len; i += 4) {
				pixels[i + 0] = 255 - pixels[i + 0];
				pixels[i + 1] = 255 - pixels[i + 1];
				pixels[i + 2] = 255 - pixels[i + 2];
			}

			this.context.putImageData(data, 0, 0);

			return this;
		},

		roundRect: function(x, y, width, height, radius) {

			this.beginPath();
			this.moveTo(x + radius, y);
			this.lineTo(x + width - radius, y);
			this.quadraticCurveTo(x + width, y, x + width, y + radius);
			this.lineTo(x + width, y + height - radius);
			this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			this.lineTo(x + radius, y + height);
			this.quadraticCurveTo(x, y + height, x, y + height - radius);
			this.lineTo(x, y + radius);
			this.quadraticCurveTo(x, y, x + radius, y);
			this.closePath();

			return this;
		},

		wrappedText: function(text, x, y, maxWidth, newlineCallback) {

			var words = text.split(" ");

			var h = this.font().match(/\d+/g)[0] * 2;

			var ox = 0;
			var oy = 0;

			if (maxWidth) {
				var line = 0;
				var lines = [""];

				for (var i = 0; i < words.length; i++) {
					var word = words[i] + " ";
					var wordWidth = this.context.measureText(word).width;

					if (ox + wordWidth > maxWidth) {
						lines[++line] = "";
						ox = 0;
					}

					lines[line] += word;

					ox += wordWidth;
				}
			} else {
				var lines = [text];
			}

			for (var i = 0; i < lines.length; i++) {
				var oy = y + i * h * 0.6 | 0;

				var text = lines[i];

				if (newlineCallback) newlineCallback.call(this, x, y + oy);

				this.fillText(text, x, oy);
			}

			return this;
		},

		textBoundaries: function(text, maxWidth) {
			var words = text.split(" ");

			var h = this.font().match(/\d+/g)[0] * 2;

			var ox = 0;
			var oy = 0;

			if (maxWidth) {
				var line = 0;
				var lines = [""];

				for (var i = 0; i < words.length; i++) {
					var word = words[i] + " ";
					var wordWidth = this.context.measureText(word).width;

					if (ox + wordWidth > maxWidth) {
						lines[++line] = "";
						ox = 0;
					}

					lines[line] += word;

					ox += wordWidth;
				}
			} else {
				var lines = [text];
				maxWidth = this.measureText(text).width;
			}

			return {
				height: lines.length * h * 0.6 | 0,
				width: maxWidth
			}
		},

		paperBag: function(x, y, width, height, blowX, blowY) {
			var lx, ly;
			this.beginPath();
			this.moveTo(x, y);
			this.quadraticCurveTo(x + width / 2 | 0, y + height * blowY | 0, x + width, y);
			this.quadraticCurveTo(x + width - width * blowX | 0, y + height / 2 | 0, x + width, y + height);
			this.quadraticCurveTo(x + width / 2 | 0, y + height - height * blowY | 0, x, y + height);
			this.quadraticCurveTo(x + width * blowX | 0, y + height / 2 | 0, x, y);
		},

		borderImage: function(image, x, y, w, h, t, r, b, l, fill) {

			/* top */
			this.drawImage(image, l, 0, image.width - l - r, t, x + l, y, w - l - r, t);

			/* bottom */
			this.drawImage(image, l, image.height - b, image.width - l - r, b, x + l, y + h - b, w - l - r, b);

			/* left */
			this.drawImage(image, 0, t, l, image.height - b - t, x, y + t, l, h - b - t);

			/* right */
			this.drawImage(image, image.width - r, t, r, image.height - b - t, x + w - r, y + t, r, h - b - t);

			/* top-left */
			this.drawImage(image, 0, 0, l, t, x, y, l, t);

			/* top-right */
			this.drawImage(image, image.width - r, 0, r, t, x + w - r, y, r, t);

			/* bottom-right */
			this.drawImage(image, image.width - r, image.height - b, r, b, x + w - r, y + h - b, r, b);

			/* bottom-left */
			this.drawImage(image, 0, image.height - b, l, b, x, y + h - b, l, b);

			if (fill) {
				if (typeof fill === "string") {
					this.fillStyle(fill).fillRect(x + l, y + t, w - l - r, h - t - b);
				} else {
					this.drawImage(image, l, t, image.width - r - l, image.height - b - t, x + l, y + t, w - l - r, h - t - b);
				}
			}
		},

		measureText: function() {
			return this.context.measureText.apply(this.context, arguments);
		},

		createRadialGradient: function() {
			return this.context.createRadialGradient.apply(this.context, arguments);
		},

		createLinearGradient: function() {
			return this.context.createLinearGradient.apply(this.context, arguments);
		},

		getImageData: function() {
			return this.context.getImageData.apply(this.context, arguments);
		}

	};

	/* extend wrapper with drawing context methods */

	var methods = ["arc", "arcTo", "beginPath", "bezierCurveTo", "clearRect", "clip", "closePath", "createImageData", "createLinearGradient", "createRadialGradient", "createPattern", "drawFocusRing", "drawImage", "fill", "fillRect", "fillText", "getImageData", "isPointInPath", "lineTo", "measureText", "moveTo", "putImageData", "quadraticCurveTo", "rect", "restore", "rotate", "save", "scale", "setTransform", "stroke", "strokeRect", "strokeText", "transform", "translate"];
	for (var i = 0; i < methods.length; i++) {
		var name = methods[i];
		if (!$.Wrapper.prototype[name]) $.Wrapper.prototype[name] = Function("this.context." + name + ".apply(this.context, arguments); return this;");
	};

	/* create setters and getters */

	var properties = ["canvas", "fillStyle", "font", "globalAlpha", "globalCompositeOperation", "lineCap", "lineJoin", "lineWidth", "miterLimit", "shadowOffsetX", "shadowOffsetY", "shadowBlur", "shadowColor", "strokeStyle", "textAlign", "textBaseline"];
	for (var i = 0; i < properties.length; i++) {
		var name = properties[i];
		if (!$.Wrapper.prototype[name]) $.Wrapper.prototype[name] = Function("if(arguments.length) { this.context." + name + " = arguments[0]; return this; } else { return this.context." + name + "; }");
	};

	/* color */

	$.Color = function(data, type) {
		if (arguments.length) this.parse(data);
	}

	$.Color.prototype = {
		parse: function(args, type) {
			if (args[0] instanceof $.Color) {
				this[0] = args[0][0];
				this[1] = args[0][1];
				this[2] = args[0][2];
				this[3] = args[0][3];
				return;
			}

			if (typeof args === "string") {
				var match = null;

				if (args[0] === "#") {
					var rgb = $.hexToRgb(args);
					this[0] = rgb[0];
					this[1] = rgb[1];
					this[2] = rgb[2];
					this[3] = 1.0;
				} else if (match = args.match(/rgb\((.*),(.*),(.*)\)/)) {
					this[0] = match[1] | 0;
					this[1] = match[2] | 0;
					this[2] = match[3] | 0;
					this[3] = 1.0;
				} else if (match = args.match(/rgba\((.*),(.*),(.*)\)/)) {
					this[0] = match[1] | 0;
					this[1] = match[2] | 0;
					this[2] = match[3] | 0;
					this[3] = match[4] | 0;
				} else if (match = args.match(/hsl\((.*),(.*),(.*)\)/)) {
					this.fromHsl(match[1], match[2], match[3]);
				} else if (match = args.match(/hsv\((.*),(.*),(.*)\)/)) {
					this.fromHsv(match[1], match[2], match[3]);
				}
			} else {
				switch (type) {
					case "hsl":
					case "hsla":

						this.fromHsl(args[0], args[1], args[2], args[3]);
						break;

					case "hsv":
					case "hsva":

						this.fromHsv(args[0], args[1], args[2], args[3]);
						break;

					default:
						this[0] = args[0];
						this[1] = args[1];
						this[2] = args[2];
						this[3] = typeof args[3] === "undefined" ? 1.0 : args[3];
						break;
				}
			}
		},

		fromHsl: function() {
			var components = arguments[0] instanceof Array ? arguments[0] : arguments;
			var color = $.hslToRgb(components[0], components[1], components[2]);

			this[0] = color[0];
			this[1] = color[1];
			this[2] = color[2];
			this[3] = typeof arguments[3] === "undefined" ? 1.0 : arguments[3];
		},

		fromHsv: function() {
			var components = arguments[0] instanceof Array ? arguments[0] : arguments;
			var color = $.hsvToRgb(components[0], components[1], components[2]);

			this[0] = color[0];
			this[1] = color[1];
			this[2] = color[2];
			this[3] = typeof arguments[3] === "undefined" ? 1.0 : arguments[3];
		},

		toArray: function() {
			return [this[0], this[1], this[2], this[3]];
		},

		toRgb: function() {
			return "rgb(" + this[0] + ", " + this[1] + ", " + this[2] + ")";
		},

		toRgba: function() {
			return "rgba(" + this[0] + ", " + this[1] + ", " + this[2] + ", " + this[3] + ")";
		},

		toHex: function() {
			return $.rgbToHex(this[0], this[1], this[2]);
		},

		toHsl: function() {
			var c = $.rgbToHsl(this[0], this[1], this[2]);
			c[3] = this[3];
			return c;
		},

		toHsv: function() {
			var c = $.rgbToHsv(this[0], this[1], this[2]);
			c[3] = this[3];
			return c;
		},

		gradient: function(target, steps) {
			var targetColor = $.color(target);
		},

		shiftHsl: function() {
			var hsl = this.toHsl();

			var h = arguments[0] === null ? hsl[0] : $.wrapValue(hsl[0] + arguments[0], 0, 1);
			var s = arguments[1] === null ? hsl[1] : $.limitValue(hsl[1] + arguments[1], 0, 1);
			var l = arguments[2] === null ? hsl[2] : $.limitValue(hsl[2] + arguments[2], 0, 1);

			this.fromHsl(h, s, l);

			return this;
		},

		setHsl: function() {
			var hsl = this.toHsl();

			var h = arguments[0] === null ? hsl[0] : $.limitValue(arguments[0], 0, 1);
			var s = arguments[1] === null ? hsl[1] : $.limitValue(arguments[1], 0, 1);
			var l = arguments[2] === null ? hsl[2] : $.limitValue(arguments[2], 0, 1);

			this.fromHsl(h, s, l);

			return this;
		}

	};

	window["cq"] = window["CanvasQuery"] = $;

	if (typeof define === "function" && define.amd) {
		define([], function() {
			return $;
		});
	}

})(window);
