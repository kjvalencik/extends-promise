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

#### `map(Function method)`

Similar to `[].map` but, waits for promises returned from the mapping function to resolve. NOTE: This will run all map functions concurrently.

```js
const P = require("extends-promise");

P.resolve([1, 2, 3])
	.map(res => P.resolve(res * 100))
	// [100, 200, 300]
	.then(console.log);
```

#### `filter(Function method)`

Similar to `[].filter` but waits for promises returned from the filtering function to resolve.

```js
const P = require("extends-promise");

P.resolve([1, 2, 3, 4])
	.filter(res => P.resolve(res % 2))
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

[depstat-url]: https://david-dm.org/kjvalencik/extends-promise
[depstat-image]: https://img.shields.io/david/dev/kjvalencik/extends-promise/master.svg?style=flat-square
