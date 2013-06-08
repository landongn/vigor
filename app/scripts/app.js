define(

	[
		'engine/core',
		'render/core',
		'scene/mainmenu',
	],

	function (Engine, Renderer, MainMenu){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function Application() {
			this.engine = new Engine();
			this.Renderer = new Renderer();

			this.Renderer.currentFrame = MainMenu;
		}

		return new Application();
});
