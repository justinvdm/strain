(function() {

  function strain(parent) {
    function type() {
      function self() {
        return self._invoke_.apply(self, arguments);
      }

      extend(self, type.prototype, true);
      self._type_ = type;
      self._props_ = extend({}, result(parent._defaults_, this));
      self._props_ = extend(self._props_, result(type._defaults_, this));
      self._init_.apply(self, arguments);
      return self;
    }

    parent = parent || function() {};
    inherit(type, parent);
    extend(type, strain);
    extend(type, parent);

    if (!parent._strain_) {
      extend(type.prototype, strain.prototype);
    }

    type._props_ = type._props_ || {};
    for (var k in type._props_) {
      type._props_[k] = extend({}, type._props_[k]);
    }

    type._currProp_ = null;
    type._defaults_ = {};
    type._strain_ = true;
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
    .static('extend', function() {
      return strain(this);
    })

    .static('prop', function(name) {
      var propDef = {
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

    .static('defaults', function(obj) {
      this._defaults_ = obj;
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
      this.meth('_init_', fn);
    })

    .static('invoke', function(fn) {
      this.meth('_invoke_', fn);
    })

    .init(function() {})

    .invoke(function() {})

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

  function result(obj, that) {
    return typeof obj == 'function'
      ? obj.call(that || this)
      : obj;
  }


  if (typeof module != 'undefined') {
    module.exports = strain;
  }
  else if (typeof define == 'function' && define.amd) {
    define(function() {
      return strain;
    });
  }
  else {
    this.strain = strain;
  }
})();
