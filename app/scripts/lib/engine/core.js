define(

	[
		'core/entity',
		'core/control',
		'engine/scenemanager'
	],

	function (Entity, Controller, SceneManager){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function Engine(args) {
			_.extend(this, args);
			this.SceneManager = new SceneManager();
			this.gamepadState = [];
			this.tickdelta = null;
			this.ticktime = null;
			this.time = new Date().getTime();
			this.tick();
		}

		Engine.prototype.__proto__ = Entity.prototype;

		Engine.prototype.gamepadButtons = {
			0: "1",
			1: "2",
			2: "3",
			3: "4",
			4: "l1",
			5: "r1",
			6: "l2",
			7: "r2",
			8: "select",
			9: "start",

			12: "up",
			13: "down",
			14: "left",
			15: "right"
		};

		Engine.prototype.keycodes = {
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
		};

		Engine.prototype.step = function () {
			if (navigator.webkitGetGamepads) {

				var gamepads = navigator.webkitGetGamepads();

				for (var i = 0; i < gamepads.length; i++) {
					var current = gamepads[i];

					if (!current) continue;

					if (!this.gamepadState[i]) {
						this.gamepadState[i] = current;
					}

					var previous = this.gamepadState[i];

					var buttons = [];

					if (previous.axes[0] !== current.axes[0] || previous.axes[1] !== current.axes[1]) {
						this.trigger("gamepadmove", current.axes[0], current.axes[1], i);
					}

					buttons[0] = current.axes[1] < 0 ? 1 : 0;
					buttons[1] = current.axes[1] > 0 ? 1 : 0;
					buttons[2] = current.axes[0] < 0 ? 1 : 0;
					buttons[3] = current.axes[0] > 0 ? 1 : 0;

					buttons = current.buttons.concat(buttons);

					for (var j = 0; j < buttons.length; j++) {
						if (previous.buttons[j] === 0 && buttons[j] === 1) this.trigger("gamepaddown", this.gamepadButtons[j], i);
						if (previous.buttons[j] === 1 && buttons[j] === 0) this.trigger("gamepadup", this.gamepadButtons[j], i);
					}

					this.gamepadState[i] = {
						buttons: buttons,
						axes: current.axes
					};
				}
			}

		};

		Engine.prototype.mousePosition = function(event, element) {
			var totalOffsetX = 0,
					totalOffsetY = 0,
					coordX = 0,
					coordY = 0,
					currentElement = element || event.target || event.srcElement,
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
		};

		Engine.prototype.tick = function() {
			var self = this;
			var now = new Date().getTime()/1000;
			this.tickdelta = now - (this.time || now);
			this.ticktime = now;

			for (var i = 0; i < this.queue_length; i++) {
				this.queue[i].tick(this.tickdelta);
			}
			console.log("tick in engine");
			self.render(self.tickdelta);
			requestAnimationFrame(self.tick);
		};

		Engine.prototype.connect = function (key, object) {
			if (!typeof this.queue_keys[key] !== 'undefined') {
				return;
			}
			this.queue_keys[key] = this.queue.length;
			this.queue.push(object);
			this.queue_length = this.queue.length;
		};

		Engine.prototype.disconnect = function (key) {
			if (typeof this.queue_keys[key] !== 'undefined') {
				this.queue.splice(this.queue_keys[key], 1);
				delete this.queue_keys[key];
				this.queue_length = this.queue.length;
			}
		};

		Engine.prototype.render = function (delta) {
			for (var i = 0; i < this.queue_length; i++) {
				this.queue[i].render(this.tickdelta);
			}
		};


		 //#####################
		 //
		 //
		 //
		 //#####################
		return Engine;
});
