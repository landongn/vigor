//#####################
// A manager of scenes.  manager.find('name').load();
//
//
//#####################

define(

	[
		'core/entity'
	],

	function (Entity){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function SceneManager(args) {
			_.extend(this, args);
			this.scenes = {}; //dict of scenes, keyed by name
			this.sceneIndexes = [];//array of key names in the scene object for fast lookups
			return this;
		}

		SceneManager.prototype.__proto__ = Entity.prototype;

		//#####################
		// return a scene by name.
		//#####################
		SceneManager.prototype.find = function(scene) {
			var match = _.indexOf(this.sceneIndex, scene);
			if (match) {
				return this.scenes[this.sceneIndex[match]];
			}
		};

		//#####################
		// Adds a scene to the manager. caches the scene object in an array for fast lookups.
		//#####################
		SceneManager.prototype.addScene = function(Scene) {
			var exists = _.indexOf(this.sceneIndex, scene);

			if (exists) {
				return false;
			}

			this.scenes[Scene.name] = Scene;
			this.sceneIndex.push(Scene.name);
			return this;
		};

		//#####################
		//## removes a scene from the manager completely.
		//#####################
		SceneManager.prototype.removeScene = function(name) {
			var exists = _.indexOf(this.sceneIndex, scene);

			if (!exists) {
				return false;
			}

			delete this.scenes[Scene.name];
			this.sceneIndex.splice(exists, 1);
			return this;
		};

		SceneManager.prototype.load = function (scene) {

		};

		return SceneManager;
});
