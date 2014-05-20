# strain

![Build Status](https://api.travis-ci.org/justinvdm/strain.png)

defines callable, method-chained js components, inspired by [d3](https://github.com/mbostock/d3)'s pretty api.


```javascript
var strain = require('strain');


var thing = strain()
  .prop('foo')
  .prop('bar', 3)
  .meth('foobar', function() {
    console.log(this.foo() + this.bar());
  });


var subthing = strain(thing)
  .init(function(arg) {
    console.log('init! ' + arg);
  })
  .prop('bar')
    .default(23)
    .get(function(v) {
      return v * 2;
    })
    .set(function(v) {
      return v + 1;
    })
  .invoke(function() {
    console.log('invoke!');
  });


var t = subthing('arg!')  // init! arg!
  .foo(22)
  .foobar()  // 68
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

if `parent` is specified, properties on the parent are attached to the type, prototype properties on the parent are attached to the type's prototype, and attaches the parent to the new type as `_super_`.


### `.prop(name[, default])`

defines a new gettable and settable property on a type.

```javascript
var t = strain().prop('foo', 23)();
console.log(t.foo());  // 23
```

if `default` is given, the property is set to the default when the type is instantiated.


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


### `.default(val)`


sets the default for the property currently being defined.

```javascript
var thing = strain()
  .prop('foo')
  .default(3);

console.log(thing().foo());  // 23
```


### `.get(fn)`


sets the coercion function to use when getting the property currently being defined.

```javascript
var thing = strain()
  .prop('foo', 23)
  .get(function(v) {
    return v * 2;
  });

console.log(thing().foo());  // 46
```


### `.set(fn)`


sets the coercion function to use when setting the property currently being defined.

```javascript
var thing = strain()
  .prop('foo')
  .set(function(v) {
    return v + 1;
  });

console.log(thing().foo(23).foo());  // 24
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
