var assert = require('assert');
var strain = require('./strain');


describe("strain", function() {
  it("should support initialisation", function() {
    var thing = strain().init(function() {
      this.foo = 'bar';
    });

    assert.equal(thing().foo, 'bar');
  });

  it("should support invocation", function() {
    var thing = strain().invoke(function() {
      return 'foo';
    });
    var t = thing();

    assert.equal(t(), 'foo');
  });

  describe("inheritance", function() {
    it("should be checkable", function() {
      function thing() {}
      var subthing = strain(thing);
      var t = subthing();
      assert(t.instanceof(thing));
      assert(t.instanceof(subthing));
    });

    it("should inherit static properties", function() {
      function thing() {}
      thing.foo = 'bar';
      var subthing = strain(thing);
      assert.equal(subthing.foo, 'bar');
    });

    it("should inherit prototype properties", function() {
      function thing() {}
      thing.prototype.foo = 'bar';
      var subthing = strain(thing);
      var t = subthing();
      assert.equal(t.foo, 'bar');
    });

    it("should inherit properties", function() {
      var thing = strain()
        .prop('foo', 'bar')
        .prop('baz', 'qux');

      var subthing = strain(thing)
        .prop('baz', 'corge');

      var t = subthing();
      assert.equal(t.foo(), 'bar');
      assert.equal(t.baz(), 'corge');
    });

    it("should inherit methods", function() {
      var thing = strain()
        .meth(function foo() {
          return 'bar';
        })
        .meth(function baz() {
          return 'qux';
        });

      var subthing = strain(thing)
        .meth(function baz() {
          return 'corge';
        });

      var t = subthing();
      assert.equal(t.foo(), 'bar');
      assert.equal(t.baz(), 'corge');
    });
  });

  describe(".prop", function() {
    it("should support property getting", function() {
      var thing = strain().prop('foo', 'bar');
      assert.equal(thing().foo(), 'bar');
    });

    it("should support property setting", function() {
      var thing = strain().prop('foo');
      assert.equal(thing().foo('bar').foo(), 'bar');
    });
  });

  describe(".default", function() {
    it("should set the default for the most recent property", function() {
      var thing = strain().prop('foo').default('bar');
      assert.equal(thing().foo(), 'bar');
    });

    it("should throw an error if no property has been defined", function() {
      assert.throws(function() {
        strain().default('bar');
      }, "can't use .default(), no property has been defined");
    });
  });

  describe(".get", function() {
    it("should use the given get hook for the most recent property", function() {
      var thing = strain().prop('foo', 2);

      assert.equal(thing().foo(), 2);
      thing.get(function(v) { return v * 2; });
      assert.equal(thing().foo(), 4);
    });

    it("should throw an error if no property has been defined", function() {
      assert.throws(function() {
        strain().get(function() {});
      }, "can't use .get(), no property has been defined");
    });
  });

  describe(".set", function() {
    it("should use the given set hook for the most recent property", function() {
      var thing = strain().prop('foo', 2);

      assert.equal(thing().foo(), 2);
      assert.equal(thing().foo(3).foo(), 3);
      thing.set(function(v) { return v * 2; });
      assert.equal(thing().foo(), 2);
      assert.equal(thing().foo(3).foo(), 6);
    });

    it("should throw an error if no property has been defined", function() {
      assert.throws(function() {
        strain().set(function() {});
      }, "can't use .set(), no property has been defined");
    });
  });

  describe(".meth", function() {
    it("should support method definition given just a function", function() {
      var thing = strain().meth(function foo() {
        return 'bar';
      });

      assert.equal(thing().foo(), 'bar');
    });

    it("should support method definition given a name and function", function() {
      var thing = strain().meth('foo', function() {
        return 'bar';
      });

      assert.equal(thing().foo(), 'bar');
    });

    it("should throw an error if no method name is given", function() {
      assert.throws(function() {
        strain().meth(function() {});
      }, "no name provided for method");
    });

    it("should return the instance when the method returns undefined", function() {
      var thing = strain()
        .meth(function foo() {
          return 'bar';
        })
        .meth(function baz() {
        });

      var t = thing();
      assert.equal(t.foo(), 'bar');
      assert.equal(t.baz(), t);
    });
  });
});
