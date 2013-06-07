define(

	[
		'engine/core',
		'render/core'
	],

	function (Engine, Renderer){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function Application() {
			this.engine = new Engine();
			this.Renderer = new Renderer();
		}

		return new Application();
});
