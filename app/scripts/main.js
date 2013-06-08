require.config({
  shim: {
  },

  paths: {
    lib: 'lib',
    engine: 'lib/engine',
    render: 'lib/renderer',
    core: 'lib/util',
    scene: 'lib/scene'
  }
});

require(['app'], function(app) {
	window.app = app;
});
