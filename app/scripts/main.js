require.config({
  shim: {
  },

  paths: {
    lib: 'lib',
    engine: 'lib/engine',
    render: 'lib/renderer',
    core: 'lib/util'
  }
});

require(['app'], function(app) {
});
