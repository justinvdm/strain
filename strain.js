(function() {
  if (typeof module != 'undefined') {
    module.exports = strain;
  }
  else {
    this.strain = strain;
  }


  function strain(parent) {
    function type() {
      function self() {
        return self._invoke_.apply(self, arguments);
      }

      self._type_ = type;
      self._props_ = extend({}, type._defaults_);
      extend(self, type.prototype, true);
      self._init_.apply(self, arguments);
      return self;
    }

    parent = parent || function() {};
    inherit(type, parent);
    extend(type, strain);
    extend(type, parent);
    extend(type.prototype, strain.prototype);

    type._defaults_ = extend({}, parent._defaults_ || {});
    return type;
  }


  strain.prop = function(name, defaultVal) {
    this.prototype[name] = function(val) {
      if (!arguments.length) {
        return this._props_[name];
      }

      this._props_[name] = val;
      return this;
    };

    this._defaults_[name] = defaultVal;
    return this;
  };


  strain.meth = function(name, fn) {
    if (typeof name == 'function') {
      fn = name;
      name = fn.name;
    }

    if (name === '') {
      throw new Error("No name provided for method");
    }

    this.prototype[name] = function() {
      var result = fn.apply(this, arguments);
      return typeof result != 'undefined'
        ? result
        : this;
    };

    return this;
  };


  strain.init = function(fn) {
    return this.meth('_init_', fn);
  };


  strain.invoke = function(fn) {
    return this.meth('_invoke_', fn);
  };


  strain.init(function() {
    return this;
  });


  strain.invoke(function() {
    return this;
  });


  strain.prototype.instanceof = function(type) {
    return isa(this._type_, type);
  };


  function extend(target, source, all) {
    all = typeof all == 'undefined'
      ? false
      : all;

      for (var k in source) {
        if (all || source.hasOwnProperty(k)) {
          target[k] = source[k];
        }
      }

      return target;
  }


  function inherit(child, parent) {
    function surrogate() {}
    surrogate.prototype = parent.prototype;
    child.prototype = new surrogate();
    child.prototype.constructor = child;
    child._super_ = parent;
    return child;
  }


  function isa(child, parent) {
    return child === parent
        || child.prototype instanceof parent;
  }
})();
