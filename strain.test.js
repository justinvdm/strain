var fs = require('fs');
var vm = require('vm');
var assert = require('assert');
var strain = require('./strain');


describe("strain", function() {
  it("should define itself as an amd module when relevant", function() {
    var result;
    define.amd = true;

    function define(module) {
      result = module();
    }

    var code = fs.readFileSync('./strain.js', 'utf8');
    vm.runInNewContext(code, {define: define});

    var thing = result().prop('foo');
    assert.equal(thing().foo(2).foo(), 2);
  });

  it("should be usable as a browser global when relevant", function() {
    var context = {};
    var code = fs.readFileSync('./strain.js', 'utf8');
    vm.runInNewContext(code, context);

    var thing = context.strain().prop('foo');
    assert.equal(thing().foo(2).foo(), 2);
  });

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
        .prop('foo')
          .default(22)
        .prop('bar')
          .default(3);

      var subthing = strain(thing)
        .prop('bar')
          .default(23)
          .get(function(v) {
            return v * 2;
          });

      assert.equal(thing().foo(), 22);
      assert.equal(thing().bar(), 3);

      assert.equal(subthing().foo(), 22);
      assert.equal(subthing().bar(), 46);
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

    it("should inherit invocation", function() {
      var thing = strain()
        .invoke(function() {
          return 'foo';
        });

      var subthing = strain(thing);
      var t = subthing();
      assert.equal(t(), 'foo');
    });
  });

  describe("defaults", function() {
    it("should merge defaults together", function() {
      var thing = strain()
        .prop('foo').default(1)
        .prop('bar')
        .prop('baz')
        .prop('qux')
        .prop('corge')
        .defaults(function() {
          return {bar: 2};
        })
        .defaults({
          bar: 3,
          baz: 4,
          qux: 5
        })
        .prop('baz').default(8)
        .defaults(function() {
          return {
            qux: 6,
            corge: 7
          };
        });

      assert.deepEqual(thing().foo(), 1);
      assert.deepEqual(thing().bar(), 3);
      assert.deepEqual(thing().baz(), 8);
      assert.deepEqual(thing().qux(), 6);
      assert.deepEqual(thing().corge(), 7);
    });

    it("should merge in parent defaults", function() {
      var thing = strain()
        .prop('foo').default(2)
        .prop('bar').default(3)
        .prop('baz')
        .prop('qux')
        .defaults({
          baz: 8,
          qux: 9
        });

      var subthing = strain(thing)
        .prop('bar').default(4)
        .defaults({baz: 7});

      assert.equal(subthing().foo(), 2);
      assert.equal(subthing().bar(), 4);
      assert.equal(subthing().baz(), 7);
      assert.equal(subthing().qux(), 9);
    });

    it("should apply setters to defaults", function() {
      var thing = strain()
        .prop('foo')
          .default(2)
          .set(function(v) {
            return v * 2;
          });

      assert.equal(thing().foo(), 4);
    });
  });

  describe(".static", function() {
    it("should support static values", function() {
      var thing = strain().static('foo', 23);
      assert.equal(thing.foo, 23);
    });

    it("should support static methods given a name and function", function() {
      var thing = strain().static('foo', function() {
        return 'bar';
      });

      assert.equal(thing.foo(), 'bar');
    });

    it("should support static methods given just a function", function() {
      var thing = strain().static(function foo() {
        return 'bar';
      });

      assert.equal(thing.foo(), 'bar');
    });

    it("should throw an error if no name is given", function() {
      assert.throws(function() {
        strain().static(function() {});
      }, "no name provided for static value");
    });

    it("should return the strain when the method returns undefined", function() {
      var thing = strain()
        .static(function foo() {
          return 'bar';
        })
        .static(function baz() {
        });

      assert.equal(thing.foo(), 'bar');
      assert.equal(thing.baz(), thing);
    });
  });

  describe(".extend", function() {
    it("should return a new child strain", function() {
      var thing = strain.extend();
      assert(thing().instanceof(strain));
      assert(thing().instanceof(thing));

      var subthing = thing.extend();
      assert(subthing().instanceof(strain));
      assert(subthing().instanceof(thing));
      assert(subthing().instanceof(subthing));
    });
  });

  describe(".prop", function() {
    it("should support property getting and setting", function() {
      var thing = strain().prop('foo');
      assert.equal(thing().foo('bar').foo(), 'bar');
    });
  });

  describe(".get", function() {
    it("should use the given get hook for the most recent property", function() {
      var thing = strain()
        .prop('foo')
        .prop('bar');

      assert.equal(thing().bar(2).bar(), 2);
      thing.get(function(v) { return v + 1; });
      assert.equal(thing().bar(2).bar(), 3);

      thing.prop('foo');
      assert.equal(thing().foo(2).foo(), 2);
      thing.get(function(v) { return v * 2; });
      assert.equal(thing().foo(2).foo(), 4);
    });

    it("should throw an error if no property has been defined", function() {
      assert.throws(function() {
        strain().get(function() {});
      }, "can't use .get(), no property has been defined");
    });

    it("should use the instance as context when calling the hook", function(done) {
      var t;

      t = strain()
        .prop('foo')
        .get(function() {
          assert.strictEqual(this, t);
          done();
        })();

      t.foo();
    });
  });

  describe(".set", function() {
    it("should use the given set hook for the most recent property", function() {
      var thing = strain()
        .prop('foo')
        .prop('bar');

      assert.equal(thing().bar(2).bar(), 2);
      thing.set(function(v) { return v + 1; });
      assert.equal(thing().bar(2).bar(), 3);

      thing.prop('foo');
      assert.equal(thing().foo(2).foo(), 2);
      thing.set(function(v) { return v * 2; });
      assert.equal(thing().foo(2).foo(), 4);
    });

    it("should throw an error if no property has been defined", function() {
      assert.throws(function() {
        strain().set(function() {});
      }, "can't use .set(), no property has been defined");
    });

    it("should use the instance as context when calling the hook", function(done) {
      var t;

      t = strain()
        .prop('foo')
        .set(function() {
          assert.strictEqual(this, t);
          done();
        })();

      t.foo(23);
    });
  });

  describe(".default", function() {
    it("should apply the given default to instances", function() {
      var thing = strain()
        .prop('foo').default(2)
        .prop('bar').default(3);

      assert.equal(thing().foo(), 2);
      assert.equal(thing().bar(), 3);
    });
  });

  describe(".defaults", function() {
    it("should apply the given defaults to instances", function() {
      var thing = strain()
        .prop('foo')
        .prop('bar')
        .defaults({
          foo: 2,
          bar: 3
        });

      assert.equal(thing().foo(), 2);
      assert.equal(thing().bar(), 3);
    });

    it("should allow defaults to be given via a function", function() {
      var thing = strain()
        .prop('foo')
        .defaults(function() {
          return {foo: {}};
        });

      assert.deepEqual(thing().foo(), {});
      assert.notStrictEqual(thing().foo(), thing().foo());
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
