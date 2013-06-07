define(

  [
  ],

  function (){
    /* jshint eqeqeq:false, noempty:false, eqnull:true, globals:define window */

    "use strict";


//#####################
// Entity.js - evented logic code for your entities.
//#####################


    function Entity(args) {
      // Initialise required storage variables
      this.actions = {};
      _.extend(this, args);
      return this;
    }

    var isArray = Array.isArray;


    Entity.prototype.on = function(type, listener, scope, once) {
      if ('function' !== typeof listener) {
        throw new Error('only functions can be used as entity callbacks');
      }

      // To avoid recursion in the case that type == "newListeners"! Before
      // adding it to the listeners, first do "newListeners".
      this.do('newListener', type, typeof listener.listener === 'function' ?
                listener.listener : listener);

      if (!this.actions[type]) {
        // Optimize the case of one listener. Don't need the extra array object.
        this.actions[type] = listener;
      } else if (isArray(this.actions[type])) {

        // If we've already got an array, just append.
        this.actions[type].push(listener);

      } else {
        // Adding the second element, need to change to array.
        this.actions[type] = [this.actions[type], listener];
      }
      return this;
    };

    Entity.prototype.once = function(type, listener, scope) {
      if ('function' !== typeof listener) {
        throw new Error('.once only takes instances of Function');
      }

      var self = this;
      function g() {
        self.stop(type, g);
        listener.apply(this, arguments);
      };

      g.listener = listener;
      self.on(type, g);

      return this;
    };

    Entity.prototype.stop = function(type, listener, scope) {
      if ('function' !== typeof listener) {
        throw new Error('stop only takes instances of Function');
      }

      // does not use listeners(), so no side effect of creating actions[type]
      if (!this.actions[type]) return this;

      var list = this.actions[type];

      if (isArray(list)) {
        var position = -1;
        for (var i = 0, length = list.length; i < length; i++) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener))
          {
            position = i;
            break;
          }
        }

        if (position < 0) return this;
        list.splice(position, 1);
        if (list.length == 0)
          delete this.actions[type];
      } else if (list === listener ||
                 (list.listener && list.listener === listener))
      {
        delete this.actions[type];
      }

      return this;
    };


    Entity.prototype.off = Entity.prototype.stop;


    Entity.prototype.removeAllListeners = function(type) {
      if (arguments.length === 0) {
        this.actions = {};
        return this;
      }

      // does not use listeners(), so no side effect of creating actions[type]
      if (type && this.actions && this.actions[type]) this.actions[type] = null;
      return this;
    };

    Entity.prototype.listeners = function(type) {
      if (!this.actions[type]) this.actions[type] = [];
      if (!isArray(this.actions[type])) {
        this.actions[type] = [this.actions[type]];
      }
      return this.actions[type];
    };

    Entity.prototype.do = function(type) {
      var type = arguments[0];
      var handler = this.actions[type];
      if (!handler) return false;

      if (typeof handler == 'function') {
        switch (arguments.length) {
          // fast cases
          case 1:
            handler.call(this);
            break;
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
        return true;

      } else if (isArray(handler)) {
        var l = arguments.length;
        var args = new Array(l - 1);
        for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

        var listeners = handler.slice();
        for (var i = 0, l = listeners.length; i < l; i++) {
          listeners[i].apply(this, args);
        }
        return true;
      } else {
        return false;
      }
    };

    return Entity;

});
