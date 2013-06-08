define(

	[

	],

	function (){
		/* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

		"use strict";

		function Bundle () {
			this.loaded = false;
			this.basepath = '/assets/bundles/';
			this.progress = 0;
			this.images = {};
			this.bundle = null;
			return this;
		}


		Bundle.prototype.add = function (src, asset) {
			this.count++;
			this.total++;
			this.loading = true;
			var key = src.match(/(.*)\..*/)[1]; //strip filename
			this.images[key] = asset;
		};


		Bundle.prototype.load = function (src) {

			var fullsrc = this.basepath + this.bundle + '/' + src;
			var self = this;
			var asset = null;


			asset = new Image();
			asset.src = fullsrc;

			asset.addEventListener('load', function () {
				self.itemLoaded();
			});

			asset.addEventListener('error', function () {
				self.error(src);
			});

			this.add(src, asset);
		};


		Bundle.prototype.itemLoaded = function () {
			this.count--;
			this.progress = (this.total - this.count) / this.total;

			if (this.count <= 0) {
				this.loading = false;
			}
			this.total = 0;
			this.count = 0;
		};


		Bundle.prototype.error = function () {
			throw new Error('invalid src,' + this.src+ '. could not load asset');
		};


		Bundle.prototype.image = function (key) {
			return this.images[key];
		};

		Bundle.prototype.addImages = function (bundle, images) {
			this.bundle = bundle;
			for (var i = 0; i < images.length; i++) {
				this.load(images[i]);
			}
		};


		return Bundle;

});
