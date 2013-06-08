	define(

	[
		'engine/core',
		'core/entity',
		'engine/entitymanager',
		'scene/scene',
		'render/bundle',
		'render/core',
	],

	function (Engine, Entity, EntityManager, Scene, Bundle, renderer){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		return new Scene({
			name: 'mainMenu',

			tick: function(dt) {
				console.log('tick, mainmenu, dt: ', dt);
			},
			render: function(dt) {
				renderer.frame.drawImage(this.assets['logo'], window.innerWidth/2, window.innerHeight/2);
			},

			setup: function () {
				this.assets = new Bundle();
				this.assets.addImages(this.name, ['logo.png']);
			},

			unload: function () {

			}
		});
});
