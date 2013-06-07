define(

	[
		'core/entity'
	],

	function (Entity){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function Renderer(args) {
			_.extend(this, args);

			cq().appendTo('body');

			requestAnimationFrame(this.step);
		}

		Renderer.prototype.__proto__ = Entity.prototype;
		Renderer.prototype.step = function (delta) {

		};
		Renderer.prototype.prerender = function (delta) {};
		Renderer.prototype.render = function(delta) {};
		Renderer.prototype.postrender = function(delta) {};
		Renderer.prototype.cleanup = function() {};

		return Renderer;
});
