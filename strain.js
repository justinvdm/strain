(function() {

  function strain(parent) {
    function type() {
      function instance() {
        return instance._invoke_.apply(instance, arguments);
      }

      extendAll(instance, type.prototype);
      instance._type_ = type;
      instance._props_ = {};
      instance._props_ = extend({}, result(parent._defaults_, instance));
      instance._props_ = extend(instance._props_, result(type._defaults_, instance));
      instance._init_.apply(instance, arguments);
      return instance;
    }

    parent = parent || function() {};
    inherit(type, parent);
    extend(type, strain);
    extend(type, parent);

    if (!parent._strain_) {
      extend(type.prototype, strain.prototype);
    }

    var props = type._props_ || {};
    type._props_ = {};

    for (var k in props) {
      type.prop(props[k]);
    }

    type._currprop_ = null;
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

    .static('prop', function(propdef) {
      propdef = typeof propdef == 'string'
        ? {name: propdef}
        : propdef;

      this._currprop_ = this._props_[propdef.name];
      if (this._currprop_) { return; }

      propdef = this._currprop_ = this._props_[propdef.name] = extend({
        get: identity,
        set: identity
      }, propdef);

      this.prototype[propdef.name] = function() {
        if (!arguments.length) {
          return propdef.get.call(this, this._props_[propdef.name]);
        }

        this._props_[propdef.name] = propdef.set.apply(this, arguments);
        return this;
      };
    })

    .static('get', function(fn) {
      if (!this._currprop_) {
        throw new Error("can't use .get(), no property has been defined");
      }

      this._currprop_.get = fn;
    })

    .static('set', function(fn) {
      if (!this._currprop_) {
        throw new Error("can't use .set(), no property has been defined");
      }

      this._currprop_.set = fn;
    })

    .static('default', function(v) {
      var defaults = {};
      defaults[this._currprop_.name] = v;
      this._defaults_ = lazyExtend(this._defaults_, defaults);
    })

    .static('defaults', function(obj) {
      this._defaults_ = lazyExtend(this._defaults_, obj);
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


  function extend(target, source) {
    for (var k in source) {
      if (source.hasOwnProperty(k)) {
        target[k] = source[k];
      }
    }

    return target;
  }


  function extendAll(target, source) {
    for (var k in source) {
      target[k] = source[k];
    }

    return target;
  }


  function lazyExtend(target, source, that) {
    that = that || this;

    return function() {
      return extend(result(target), result(source));
    };
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
