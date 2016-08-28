"use strict";

const assert = require("assert");

const P = require("..");

const describe = global.describe;
const it = global.it;

describe("Promise", () => {
	describe(".then", () => {
		it("should be able to use as promise", () => {
			return new P(resolve => resolve())
				.then(() => P.resolve(1))
				.then(res => assert.strictEqual(res, 1));
		});
	});

	describe(".promisify", () => {
		it("should be able to promisify callback method", () => {
			const fn = P.promisify((x, cb) => cb(null, x));

			return fn(1)
				.then(res => assert.strictEqual(res, 1));
		});

		it("should reject callback method with error", () => {
			const fn = P.promisify(cb => cb(new Error("Callback error")));

			return fn()
				.then(() => Promise.reject(new Error("Did not reject")))
				.catch(err => assert.strictEqual(err.message, "Callback error"));
		});

		it("should convert multiple arguments in callback to array", () => {
			const fn = P.promisify((x, y, cb) => cb(null, x, y));

			return fn(1, 2)
				.then(res => assert.deepEqual(res, [1, 2]));
		});

		it("should be able to pass context to promisify", () => {
			const fn = P.promisify(function callbackMethod(cb) {
				cb(null, this);
			}, 1);

			return fn()
				.then(res => assert.strictEqual(res, 1));
		});

		it("should use dynamic context if not specified", () => {
			const o = {
				fn : P.promisify(function callbackMethod(cb) {
					cb(null, this);
				})
			};

			return o.fn()
				.then(res => assert.strictEqual(res, o));
		});
	});

	describe(".promisifyAll", () => {
		it("should promisify all methods on an object", () => {
			const add = (x, y, cb) => cb(null, x + y);
			const o = P.promisifyAll({
				addOne : add.bind(null, 1),
				addTwo : add.bind(null, 2)
			});

			return P.all([
				o.addOneAsync(1).then(x => assert.strictEqual(x, 2)),
				o.addTwoAsync(1).then(x => assert.strictEqual(x, 3))
			]);
		});

		it("should return original object", () => {
			const o = {};

			assert.strictEqual(P.promisifyAll(o), o);
		});

		it("should not attempt to promisify values that are not functions", () => {
			const o = P.promisifyAll({
				add : (x, y, cb) => cb(null, x + y),
				str : "test"
			});

			assert.deepEqual(Object.keys(o).sort(), ["add", "addAsync", "str"]);
		});

		it("should be able to specify suffix", () => {
			const o = P.promisifyAll({
				add : (x, y, cb) => cb(null, x + y)
			}, {
				suffix : "Promise"
			});

			return o
				.addPromise(1, 2)
				.then(x => assert.strictEqual(x, 3));
		});

		it("should be able to overwrite original method with no suffix", () => {
			const o = P.promisifyAll({
				add : (x, y, cb) => cb(null, x + y)
			}, {
				suffix : ""
			});

			return o
				.add(1, 2)
				.then(x => assert.strictEqual(x, 3));
		});

		it("should be able to reject promisified methods", () => {
			const fnErr = new Error("Test error");
			const o = P.promisifyAll({
				fn : cb => cb(fnErr)
			});

			return o
				.fnAsync()
				.then(() => P.reject(new Error("Did not reject")))
				.catch(err => assert.strictEqual(err, fnErr));
		});

		it("should be able to filter methods", () => {
			const o = P.promisifyAll({
				a : cb => cb(),
				b : cb => cb()
			}, {
				filter : name => name === "a"
			});

			assert.deepEqual(Object.keys(o).sort(), ["a", "aAsync", "b"]);
		});

		it("should provide correct arguments to filter", () => {
			const fn = cb => cb();
			const o = { fn };

			P.promisifyAll(o, {
				filter : (name, method, obj) => {
					assert.strictEqual(name, "fn");
					assert.strictEqual(method, fn);
					assert.strictEqual(obj, o);
				}
			})
		});

		it("should have correct binding context on promisified methods", () => {
			const o = P.promisifyAll({
				fn(cb) {
					assert.strictEqual(this, o);
					cb();
				}
			});

			return o.fnAsync();
		});
	});

	describe(".try", () => {
		it("should return a promise from a synchronous function", () => {
			return P
				.try(() => "test")
				.then(res => assert.strictEqual(res, "test"));
		});

		it("should return a rejected promise on synchronous exception", () => {
			const fnErr = new Error("Test error");

			return P
				.try(() => {
					throw fnErr;
				})
				.then(() => P.reject(new Error("Did not reject")))
				.catch(err => assert.strictEqual(err, fnErr));
		});

		it("should wait for a resolved promise", () => {
			return P
				.try(() => P.resolve("test"))
				.then(res => assert.strictEqual(res, "test"));
		});

		it("should wait for a rejected promise", () => {
			const fnErr = new Error("Test error");

			return P
				.try(() => P.reject(fnErr))
				.then(() => P.reject(new Error("Did not reject")))
				.catch(err => assert.strictEqual(err, fnErr));
		});
	});

	describe(".method", () => {
		it("should return a method that returns a promise from a synchronous function", () => {
			return P
				.method(() => "test")()
				.then(res => assert.strictEqual(res, "test"));
		});

		it("should return a rejected promise on synchronous exception", () => {
			const fnErr = new Error("Test error");

			return P
				.method(() => {
					throw fnErr;
				})()
				.then(() => P.reject(new Error("Did not reject")))
				.catch(err => assert.strictEqual(err, fnErr));
		});

		it("should pass arguments to promisified function", () => {
			return P
				.method((a, b, c) => [a, b, c])(1, 2, 3)
				.then(res => assert.deepEqual(res, [1, 2, 3]));
		});

		it("should pass `this` context to promisified function", () => {
			const o = {
				fn() {
					return this;
				}
			};

			return Object
				.assign(o, {
					fn : P.method(o.fn)
				})
				.fn()
				.then(res => assert.strictEqual(res, o));
		});
	});

	describe(".fromCallback", () => {
		it("should be able to use fromCallback to promisify", () => {
			return P
				.fromCallback(cb => cb(null, 1))
				.then(res => assert.strictEqual(res, 1));
		});

		it("should reject fromCallback with error", () => {
			return P
				.fromCallback(cb => cb(new Error("Callback error")))
				.then(() => Promise.reject(new Error("Did not reject")))
				.catch(err => assert.strictEqual(err.message, "Callback error"));
		});
	});

	describe(".toCallback", () => {
		it("should be able to convert resolved promise to callback", cb => {
			P.resolve(1)
				.toCallback((err, res) => {
					assert.strictEqual(err, null);
					assert.strictEqual(res, 1);

					cb();
				});
		});

		it("should be able to convert rejected promise to callback", cb => {
			const testErr = new Error("Test error");

			P.reject(testErr)
				.toCallback((err, res) => {
					assert.strictEqual(err, testErr);
					assert.strictEqual(res, undefined);

					cb();
				});
		});
	});

	describe(".extend", () => {
		it("should be able to extend existing Promise implementation", () => {
			class APromise extends Promise {}

			assert.strictEqual(P.extend(APromise), APromise);
			assert.strictEqual(APromise.promisify, P.promisify);

			return APromise
				.resolve()
				.return(1)
				.tap(res => assert.strictEqual(res, 1))
				.then(res => assert.strictEqual(res, 1));
		});
	});
});
