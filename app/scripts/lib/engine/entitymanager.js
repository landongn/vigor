define(

	[
		'core/entity'
	],

	function (Entity){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function EntityManager(args) {
			_.extend(this, args);
			this.index = 0;
			this.entities = [];
			this.dirty = false;
		}


		EntityManager.prototype.__proto__ = Entity.prototype;

		EntityManager.prototype.add = function(entity) {
			this.entities.push(entity);
			this.index++;
		};

		EntityManager.prototype.clean = function () {
			for (var i = 0; i < this.entities.length; i++) {
				if (this.entities[i]._dirty) {
					this.entities.splice(this.entities[i], 1);
					this.index--;
				}
			};
		};

		EntityManager.prototype.update = function() {
			if (this.dirty) {
				this.dirty = false;
				this.clean();
				this.entities.sort(function(a, b){
					return (a.zindex | 0) - (b.zindex | 0);
				});
			}
			var args = Array.prototype.slice.call(arguments, 1);
			for (var i = 0; i < this.entities.length; i++) {
				if (this.entities[i].update) {
					this.entities[i].update.apply(this.entities[i], args);
				}
			}
		};

		EntityManager.prototype.draw = function() {
			var args = Array.prototype.slice.call(arguments, 1);
			for (var i = 0; i < this.entities.length; i++) {
				if (this.entities[i].draw) {
					this.entities[i].draw.apply(this.entities[i], args);
				}
			}
		};


		return EntityManager;
});
