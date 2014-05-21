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

      extend(self, type.prototype, true);
      self._type_ = type;
      self._props_ = {};

      for (var k in type._props_) {
        self._props_[k] = type._props_[k].default;
      }

      self._init_.apply(self, arguments);
      return self;
    }

    parent = parent || function() {};
    inherit(type, parent);
    extend(type, strain);
    extend(type, parent);
    extend(type.prototype, strain.prototype);

    type._props_ = type._props_ || {};
    for (var k in type._props_) {
      type._props_[k] = extend({}, type._props_[k]);
    }
    type._currProp_ = null;
    return type;
  }


  strain.static = function(name, val) {
    if (typeof name == 'function') {
      val = name;
      name = val.name;
    }

    if (name === '') {
      throw new Error("no name provided for static value");
    }

    this[name] = typeof val == 'function'
      ? chained(val)
      : val;

    return this;
  };


  strain
    .static('prop', function(name, defaultVal) {
      var propDef = {
        default: defaultVal,
        get: identity,
        set: identity
      };

      this.prototype[name] = function() {
        if (!arguments.length) {
          return propDef.get.call(this, this._props_[name]);
        }

        this._props_[name] = propDef.set.apply(this, arguments);
        return this;
      };

      this._currProp_ = propDef;
      this._props_[name] = propDef;
    })

    .static('default', function(val) {
      if (!this._currProp_) {
        throw new Error("can't use .default(), no property has been defined");
      }
      this._currProp_.default = val;
    })

    .static('get', function(fn) {
      if (!this._currProp_) {
        throw new Error("can't use .get(), no property has been defined");
      }

      this._currProp_.get = fn;
    })

    .static('set', function(fn) {
      if (!this._currProp_) {
        throw new Error("can't use .set(), no property has been defined");
      }

      this._currProp_.set = fn;
    })

    .static('meth', function(name, fn) {
      if (typeof name == 'function') {
        fn = name;
        name = fn.name;
      }

      if (name === '') {
        throw new Error("no name provided for method");
      }

      this.prototype[name] = chained(fn);
    })

    .static('init', function(fn) {
      return this.meth('_init_', fn);
    })

    .static('invoke', function(fn) {
      return this.meth('_invoke_', fn);
    })

    .init(function() {
      return this;
    })

    .invoke(function() {
      return this;
    })

    .meth('instanceof', function(type) {
      return isa(this._type_, type);
    });


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


  function identity(v) {
    return v;
  }


  function chained(fn) {
    return function() {
      var result = fn.apply(this, arguments);

      return typeof result != 'undefined'
        ? result
        : this;
    };
  }
})();
