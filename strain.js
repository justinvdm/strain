(function() {
  function strain(parent) {
    function type() {
      return type._invoke_.apply(type, arguments);
    }

    parent = parent || function() {};
    inherit(type, parent);
    extend(type, strain);
    extend(type, parent);

    var propList = type._propList_ || [];
    type._props_ = {};
    type._propList_ = [];
    propList.forEach(type.prop, type);

    type._super_ = parent;
    type._currprop_ = null;
    type._strain_ = true;
    type._defaults_ = {};

    if (!parent._strain_) {
      extend(type.prototype, strain.prototype);
    } else {
      type._defaults_ = lazyExtend(type._defaults_, parent._defaults_);
    }

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
    .static('_new_', function() {
      function instance() {
        return instance._invoke_.apply(instance, arguments);
      }

      extendAll(instance, this.prototype);
      instance._type_ = this;
      instance._props_ = {};

      var defaults = {};
      for (var k in this._props_) {
        defaults[k] = null;
      }

      defaults = extend(defaults, result(this._super_._defaults_, instance));
      extend(defaults, result(this._defaults_, instance));

      for (k in defaults) {
        instance[k](defaults[k]);
      }

      instance._init_.apply(instance, arguments);
      return instance;
    })

    .static('_invoke_', function() {
      return this._new_.apply(this, arguments);
    })

    .static('new', function() {
      return this._new_.apply(this, arguments);
    })

    .static('extend', function() {
      return strain(this);
    })

    .static('prop', function(propdef) {
      propdef = typeof propdef == 'string'
        ? {name: propdef}
        : propdef;

      this._currprop_ = this._props_[propdef.name];
      if (this._currprop_) { return; }

      propdef = extend({
        get: identity,
        set: identity
      }, propdef);

      this._currprop_ = propdef;
      this._props_[propdef.name] = propdef;
      this._propList_.push(propdef);

      this.prototype[propdef.name] = function() {
        if (!arguments.length) {
          return propdef.get.call(this, this._props_[propdef.name]);
        }

        var v = propdef.set.apply(this, arguments);
        this._props_[propdef.name] = typeof v == 'undefined'
          ? null
          : v;

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

    .static('instanceof', function(instance, type) {
      return ((instance || 0)._type_ || 0)._strain_
        ? instance.instanceof(type)
        : instance instanceof type;
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
    })

    .meth('prop', function(name) {
      if (!(name in this._props_)) {
        return null;
      }

      var args = Array.prototype.slice.call(arguments, 1);
      return this[name].apply(this, args);
    })

    .meth('props', function() {
      var result = {};

      for (var k in this._props_) {
        result[k] = this.prop(k);
      }

      return result;
    })

    .meth('toJSON', function() {
      return this.props();
    })

    .meth('invoke', function() {
      return this._invoke_.apply(this, arguments);
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
    return function() {
      return extend(
          result(target, that || this),
          result(source, that || this));
    };
  }


  function inherit(child, parent) {
    function surrogate() {}
    surrogate.prototype = parent.prototype;
    child.prototype = new surrogate();
    child.prototype.constructor = child;
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
}).call(this);
