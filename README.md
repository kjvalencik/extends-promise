[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Status][depstat-image]][depstat-url]

# extends-promise

> Promise based micro-library with functional methods.

Promise based micro-library that extends v8 native promises with functional and helper methods. This library has zero dependencies, which makes it perfect for embedding in simple scripts. If you are using this in larger projects, you may want to take a look at [Bluebird](https://github.com/petkaantonov/bluebird).

## API

Additional examples are available in [tests](tests).

### Static Helpers

#### `promisify(Function fn, context)`

Convert a method that takes a callback into one that returns a promise.

```js
const fs = require("fs");
const P  = require("extends-promise");

const readfile = P.promisify(fs.readfile);

readfile("./some-file.txt").then(console.log);
```

#### `promisifyAll(Object obj[, options])`

Helper method to promisify all methods on an object.

```js
const o = P.promisifyAll({
	add    : (x, y, cb) => cb(null, x + y),
	addOne : (x, cb) => cb(null, x + 1)
});

o.addAsync(1, 2).then(console.log);
o.addOneAsync(2).then(console.log);
```

##### Options

Optionally, you can choose a suffix to append instead of "Async". Choosing an empty string will overwrite the original method. You may also provide a filter method that will filter the methods on the object that will be promisified. This can be useful if some of the methods are synchronous and should not be promisified.

```js
// Defaults
{
	suffix : "Async",
	filter : (name, method, obj) => true
}
```

#### `try(Function method)`

Similar to a synchronous `try {}` block but, for promises. The result of `P.try` will always be a promise even if the method returned or threw synchronously.

```js
P
	.try(() => {
		const r = Math.floor(Math.random() * 5);

		switch (r) {
			case 0: return 0;
			case 1: return P.resolve(1);
			default: throw new Error("Something bad happened!");
		}
	})
	.then(console.log)
	.catch(console.error);
```

#### `method(Function method)`

Creates a method from the provided function that will always return a promise. Similar to `P.try`, but returns a method instead of invoking one. It will also accept arguments and maintain the `this` context.

```js
const Calc = {
	add : P.method(function add(x, y) {
		return x + y;
	})
};

Calc
	.add(1, 2)
	.then(console.log);
```

#### `fromCallback(Function callback)`

Ad-hoc conversion from a callback to a promise. Also, useful for promisifying
methods where the callback is not the last argument.

```js
const P = require("extends-promise");

P
	.fromCallback(cb => {
		setTimeout(() => cb(null, "Hello, World!"), 1000);
	})
	.then(console.log);
```

#### `defer(Function fn)`

Creates a `promise` along with distinct `resolve` and `reject` methods. This is handy
if you need a promise placeholder or need to promisify something non-standard. In most
cases you are better off with `new P((resolve, reject) => {})` or `P.promisify`. Beware of
[the deferred anti-pattern](https://github.com/petkaantonov/bluebird/wiki/Promise-anti-patterns#the-deferred-anti-pattern).

```js
const P = require("extends-promise");

const deferred = P.defer();

deferred.promise.then(console.log);
deferred.resolve("Hello, World!");
```

```js
const P = require("extends-promise");

const deferred = P.defer();

deferred.promise.catch(console.error);
deferred.reject(new Error("Goodbye, World!"));
```

#### `extend(Promise)`

Extend a promise implementation with methods in this library. Useful if you want
to duck-type the built-in promise everywhere.

```js
const P = require("extends-promise");

P.extend(Promise);

Promise
	.resolve("Hello, World!")
	.delay(1000)
	.then(console.log);
```

### Instance Methods

#### `return(value)`

Short-hand for returning a value from a `.then`.

```js
const P = require("extends-promise");

P.resolve()
	.return("Hello, World!")
	.then(console.log);

// Equivalent
P.resolve()
	.then(() => "Hello, World!")
	.then(console.log);
```

#### `call(String method, ...arguments)`

Short-hand for invoking a method on the result of a promise.

```js
const P = require("extends-promise");

P.resolve(10)
	.call("toString", 16)
	.then(res => res === "a");

// Equivalent
P.resolve(10)
	.then(res => res.toString(16))
	.then(res => res === "a");
```

#### `delay(Number milliseconds)`

Delay the resolution of a promise by `N` milliseconds. NOTE: This does not delay exceptions.

```js
const P = require("extends-promise");

P.resolve("Hello, World!")
	.delay(1000)
	.then(console.log);
```

#### `tap(Function method)`

Like `.then`, except returns a promise for the original value. Useful for side effects like logging.

```js
const P = require("extends-promise");

P.resolve(100)
	.tap(console.log)
	.then(res => res === 100);
```

#### `map(Function method[, options])`

Similar to `[].map` but, waits for promises returned from the mapping function to resolve. By
default all methods will be run concurrently. You may also pass a concurrency option,
`{ concurrency : 1 }`.

```js
const P = require("extends-promise");

P.resolve([1, 2, 3])
	.map(res => P.resolve(res * 100))
	// [100, 200, 300]
	.then(console.log);
```

```js
const P = require("extends-promise");

P.resolve([1, 2, 3])
	.map(res => P.delay(Math.random() * 100, res), {
		concurrency : 3
	})
	// [1, 2, 3]
	.then(console.log);
```

#### `filter(Function method[, options])`

Similar to `[].filter` but waits for promises returned from the filtering function to resolve. By
default all methods will be run concurrently. You may also pass a concurrency option,
`{ concurrency : 1 }`.

```js
const P = require("extends-promise");

P.resolve([1, 2, 3, 4])
	.filter(res => P.resolve(res % 2))
	// [1, 3]
	.then(console.log);
```

```js
const P = require("extends-promise");

P.resolve([1, 2, 3, 4])
	.filter(res => P.delay(Math.random() * 100, res % 2), {
		concurrency : 3
	})
	// [1, 3]
	.then(console.log);
```

#### `reduce(Function method[, initialValue])`

Similar to `[].reduce` but, waits for each iteration to resolve before calling the next method. The callback method may return promises or values. The optional intialValue may also be a value, promise.

```js
const P = require("extends-promise");

P.resolve([2, 3, 4])
	.reduce((y, x) => y + x, 1)
	.then(console.log);
```

#### `forEach(Function method)`

Similar to `[].forEach` but, accepts a method that returns a promise. Each iteration of the loop will run serially.

```js
const P = require("extends-promise");

P.resolve([1, 2, 3])
	.forEach(console.log);
```

#### `toCallback(Function callback)`

Converts a promise back into callback style async. Uses error first convention.

```js
P.resolve(1)
	.toCallback((err, res) => console.log(res));
````

### Instance Short-hand Statics

Each of the following instance methods are also available as static methods which accept a resolved value.

* `delay(ms, value)`
* `map(Array, Function)`
* `filter(Array, Function)`
* `reduce(Array, Function[, initialValue])`
* `forEach(Array, Function)`

## Contributing

Contributions are welcome either as pull requests or feature requests. If you are opening a pull request, please ensure that your code passes tests and lint.

Also, zero dependencies is an explicit goal of this project to make it easy to include in any script. Pull requests containing additional dependencies (excluding `devDependencies`) will not be accepted.

Thanks!

## License

[MIT License](LICENSE)

[npm-url]: https://npmjs.org/package/extends-promise
[npm-image]: https://img.shields.io/npm/v/extends-promise.svg?style=flat-square

[travis-url]: http://travis-ci.org/kjvalencik/extends-promise
[travis-image]: https://img.shields.io/travis/kjvalencik/extends-promise/master.svg?style=flat-square

[coveralls-url]: https://coveralls.io/r/kjvalencik/extends-promise
[coveralls-image]: https://img.shields.io/coveralls/kjvalencik/extends-promise/master.svg?style=flat-square

[depstat-url]: https://david-dm.org/kjvalencik/extends-promise#info=devDependencies
[depstat-image]: https://img.shields.io/david/dev/kjvalencik/extends-promise/master.svg?style=flat-square
