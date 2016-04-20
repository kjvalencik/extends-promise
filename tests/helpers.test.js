"use strict";

const assert = require("assert");

const P = require("..");

const describe = global.describe;
const it = global.it;

describe("Helpers", () => {
	describe(".defer", () => {
		it("should be able to resolve a deferred promise", () => {
			const d = P.defer();

			d.resolve(1);

			return d.promise.then(res => assert.strictEqual(res, 1));
		});

		it("should be able to reject a deferred promise", () => {
			const d = P.defer();
			const err = new Error();

			d.reject(err);

			return d.promise
				.then(() => P.reject(new Error()))
				.catch(res => assert.strictEqual(res, err));
		});
	});

	describe(".return", () => {
		it("should be able to return value", () => {
			return P
				.resolve(1)
				.return(2)
				.then(res => assert.strictEqual(res, 2));
		});
	});

	describe(".call", () => {
		it("should be able to invoke a method", () => {
			return P
				.resolve(1)
				.call("toString")
				.then(res => assert.strictEqual(res, "1"));
		});

		it("should be able to invoke a method with arguments", () => {
			return P
				.resolve(10)
				.call("toString", 16)
				.then(res => assert.strictEqual(res, "a"));
		});
	});

	describe(".delay", () => {
		it("should defer resolution of promise", () => {
			let res = null;

			P.resolve(1)
				.delay(10)
				.then(x => res = x);

			return P
				.resolve()
				.then(() => assert.strictEqual(res, null))
				.delay(20)
				.then(() => assert.strictEqual(res, 1));
		});

		it("should resolve value", () => {
			return P
				.resolve(1)
				.delay(1)
				.then(res => assert.strictEqual(res, 1));
		});

		it("should be available as static method", () => {
			return P
				.delay(1, 5)
				.then(res => assert.strictEqual(res, 5));
		});
	});

	describe(".tap", () => {
		it(".tap: should be able to call then without affecting chain", () => {
			return P
				.resolve(1)
				.tap(() => 2)
				.then(res => assert.strictEqual(res, 1));
		});

		it(".tap: should wait for returned promise to resolve", () => {
			let waited = false;

			return P
				.resolve(1)
				.tap(() => {
					return P
						.resolve(1)
						.delay(1)
						.then(() => waited = true);
				})
				.then(() => assert.strictEqual(waited, true));
		});
	});
});
