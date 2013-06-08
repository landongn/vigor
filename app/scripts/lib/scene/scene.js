	define(

	[
		'engine/core',
		'core/entity',
		'engine/entitymanager',
		'engine/scenemanager',
		'render/bundle'
	],

	function (Engine, Entity, EntityManager, SceneManager, Bundle){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function Scene(args) {
			_.extend(this, args);
			var self = this;
			this.assets = null;
			this.on('ready', function () {
				Engine.connect(self.name, self);
				console.log('connected scene: ', self.name);
				Engine.SceneManager.addScene(self);
			});

			this.setup ? this.setup() : null;
		}

		Scene.prototype.__proto__ = Entity.prototype;

		return Scene;
});
