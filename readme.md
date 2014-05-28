# strain

![Build Status](https://api.travis-ci.org/justinvdm/strain.png)

defines callable, method-chained js components, inspired by [d3](https://github.com/mbostock/d3)'s pretty api.


```javascript
var strain = require('strain');


var thing = strain()
  .prop('foo')
    .default(22)
  .prop('bar')
    .default(3)

  .meth('foobar', function() {
    console.log(this.foo() + this.bar());
  });


var subthing = strain(thing)
  .prop('bar')
    .default(23)
    .get(function(v) {
      return v * 2;
    })
    .set(function(v) {
      return v + 1;
    })

  .init(function(arg) {
    console.log('init! ' + arg);
  })

  .invoke(function() {
    console.log('invoke!');
  });


var t = subthing('arg!')  // init! arg!
  .foobar()  // 70
  .bar(42)
  .foobar();  // 108


t();  // invoke!
```


## install

node:

```
$ npm install strain
```

browser:

```
$ bower install strain
```

```html
<script src="/bower_components/strain/strain.js"></script>
```


## api

### `strain([parent])`

creates a new type.

```javascript
var eventable = strain(EventEmitter);

eventable()
  .on('foo', function() {
    console.log('bar');
  })
  .emit('foo');  // bar
```

if `parent` is specified, properties on the parent are attached to the type, prototype properties on the parent are accessible via the type's prototype, and the parent is attached to the new type as `_super_`.


### `.extend()`

creates a child type from the calling type. shorthand for `strain(<type>)`.

```javascript
var thing = strain.extend();
var subthing = thing.extend();
```


### `.new()`

creates a new instance of the type.

```javascript
strain()
  .init(function(arg) {
    console.log(arg);
  })
  .new('foo');  // foo
```


### `.static(name, value)`

defines a new property directly on the calling type.

```javascript
var thing = strain()
  .static('foo', 23)
  .static('bar', function() {
    console.log('bar!');
  })
  .bar()  // bar!
  .bar();  // bar!

console.log(thing.foo);  // 23
```

if `value` is a function that does not return a value or returns `undefined`, the type is returned instead to allow for further method chaining.


### `.static(fn)`

defines a new method directly on the calling type from a named function.

```javascript
var thing = strain()
  .static(function bar() {
    console.log('bar!');
  })
  .bar()  // bar!
  .bar();  // bar!
```

if `fn` does not return a value or returns `undefined`, the type is returned instead to allow for further method chaining.


### `.prop(name)`

defines or re-references a new gettable and settable property on a type.

```javascript
var t = strain().prop('foo')();
console.log(t.foo());  // 23
```

re-referencing a property allows [`.default`](#defaultv), [`.set`](#setfn) and [`.get`](#getfn) to be applied to a property after it has been defined (possibly by a parent type), without breaking method chaining for the type currently being defined.


### `.default(v)`

sets the default value of the most recently referenced property.

```javascript
var thing = strain()
  .prop('foo')
  .prop('bar').default(23)
  .prop('foo').default(42);

console.log(thing().foo());  // 42
console.log(thing().bar());  // 23
```

note that setting mutable values using [`.default`](#defaultv) means that all instances of the type will be affected by modifications to the value. [`.init`](#initfn) or [`.defaults`](#defaultsfn) could be used if you need to create mutables per-instance.


### `.get(fn)`

sets the coercion function to use when getting the most recently referenced property.

```javascript
var thing = strain()
  .prop('foo')
  .prop('bar').get(function(v) {
    return v + 1;
  })
  .prop('foo').get(function(v) {
    return v * 2;
  });

console.log(thing().bar(23).bar());  // 24
console.log(thing().foo(42).foo());  // 84
```


### `.set(fn)`

sets the coercion function to use when setting the most recently referenced property.

```javascript
var thing = strain()
  .prop('foo')
  .prop('bar').set(function(v) {
    return v + 1;
  })
  .prop('foo').set(function(v) {
    return v * 2;
  });

console.log(thing().bar(23).bar());  // 24
console.log(thing().foo(42).foo());  // 84
```


### `.meth(name, fn)`

defines a new method on a type.

```javascript
var thing = strain()
  .meth('foo', function() {
    return 23;
  })
  .meth('bar', function() {
    console.log(this.foo());
  })();


thing()
  .bar()  // 23
  .bar()  // 23
  .bar();  // 23
```

if `fn` does not return a value or returns `undefined`, the type's instance is returned instead to allow for further method chaining.


### `.meth(fn)`

defines a new method on a type from a *named* function.

```javascript
var thing = strain()
  .meth(function foo() {
    console.log('bar');
  })();


thing().foo();  // bar
```


### `.defaults(obj)`

sets the default values of properties for each new instance using a data object.

```javascript
var thing = strain()
  .prop('foo')
  .defaults({foo: 23});

console.log(thing().foo());  // 23
```


### `.defaults(fn)`

sets the default values of properties for each new instance using a function that returns a data object.

```javascript
var thing = strain()
  .prop('foo')
  .defaults(function() {
    return {foo: 23};
  });

console.log(thing().foo());  // 23
```

the given function is invoked at initialisation time for each new instance.


### `.init(fn)`

defines a function to be called on initialisation. shorthand for `.meth('_init_', fn)`.

```javascript
var thing = strain().init(function() {
  this.foo = 'bar'
});


console.log(thing().foo);  // bar
```


### `.invoke(fn)`

defines the function that is called when the instance is called. shorthand for `.meth('_invoke_', fn)`.

```javascript
var t = strain().invoke(function() {
  return 23;
})();


console.log(t());  // 23
```


### `<instance>.prop(name[, value])`

gets or sets a property by its name.


```javascript
var thing = strain().prop('foo')
console.log(thing().prop('foo', 'bar').prop('foo'));  // bar
```


### `<instance>.invoke([arg1[, arg2[, ...]]])`

calls the instance with the given args.


```javascript
strain()
  .invoke(function(arg) {
    console.log(arg);
  })
  .new()
  .invoke('foo');  // foo
```


### `<instance>.instanceof(type)`

determines whether calling instance is an instance of the given type.


```javascript
function thing() {}
var subthing = strain(thing);
var t = subthing();
console.log(t.instanceof(thing));  // true
console.log(t.instanceof(t));  // false
```

this is a workaround, since there is no easy, portable way to construct a callable with a properly set up prototype chain in js.
