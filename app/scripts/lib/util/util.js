define(

	[
	],

	function (){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		return {
			distance: function(x1, y1, x2, y2) {
				return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y2));
			},
			randomHexColor: function () {
				return '#'+Math.floor(Math.random()*16777215).toString(16);
			}
		};
});
