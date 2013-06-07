define(

	[
		'core/entity',
		'core/control',
		'engine/scenemanager',
	],

	function (Entity, Controller, SceneManager){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function Engine(args) {
			_.extend(this, args);
			this.sceneManager = new SceneManager();
		}

		Engine.prototype.__proto__ = Entity.prototype;
		Engine.prototype.step = function (delta) {};
		Engine.prototype.prerender = function (delta) {};
		Engine.prototype.render = function(delta) {};
		Engine.prototype.postrender = function(delta) {};
		Engine.prototype.cleanup = function() {};

		return Engine;
});
