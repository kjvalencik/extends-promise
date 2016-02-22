"use strict";

const assert = require("assert");

const P = require("..");

const describe = global.describe;
const it = global.it;

describe("Helpers", () => {
	it(".return: should be able to return value", () => {
		return P
			.resolve(1)
			.return(2)
			.then(res => assert.strictEqual(res, 2));
	});

	it(".call: should be able to invoke a method", () => {
		return P
			.resolve(1)
			.call("toString")
			.then(res => assert.strictEqual(res, "1"));
	});

	it(".call: should be able to invoke a method with arguments", () => {
		return P
			.resolve(10)
			.call("toString", 16)
			.then(res => assert.strictEqual(res, "a"));
	});

	// TODO: Find a way to use sinon.js fake timers
	// https://github.com/sinonjs/sinon/issues/738
	it(".delay: should defer resolution of promise", () => {
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

	it(".delay: should resolve value", () => {
		return P
			.resolve(1)
			.delay(1)
			.then(res => assert.strictEqual(res, 1));
	});

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
