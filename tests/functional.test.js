"use strict";

const assert = require("assert");

const P = require("..");

const describe = global.describe;
const it = global.it;

describe("Functional", () => {
	describe(".map", () => {
		it("should map function resolved array", () => {
			return P
				.resolve([1, 2, 3])
				.map(x => x * 10)
				.then(res => assert.deepEqual(res, [10, 20, 30]));
		});

		it("should wait for mapped promises to resolve", () => {
			return P
				.resolve([1])
				.map(x => P.resolve(x * 10))
				.then(res => assert.deepEqual(res, [10]));
		});

		it("should be available as a static method", () => {
			return P
				.map([1, 2, 3], x => x * 10)
				.then(res => assert.deepEqual(res, [10, 20, 30]));
		});

		it("should accept concurrency bound", () => {
			const concurrency = 3;
			let running = 0;

			return P
				.map(Array(10).fill(0), () => {
					running += 1;

					assert(running <= concurrency, "Too much concurrency!");

					return P
						.delay(5)
						.then(() => running -= 1);
				}, { concurrency });
		});
	});

	describe(".filter", () => {
		it("should filter resolved array", () => {
			return P
				.resolve([1, 2, 3, 4])
				.filter(x => x % 2)
				.then(res => assert.deepEqual(res, [1, 3]));
		});

		it("should wait for async filter methods", () => {
			return P
				.resolve([1, 2, 3, 4])
				.filter(x => P.resolve(x % 2))
				.then(res => assert.deepEqual(res, [1, 3]));
		});

		it("should be available as a static method", () => {
			return P
				.filter([1, 2, 3, 4], x => x % 2)
				.then(res => assert.deepEqual(res, [1, 3]));
		});

		it("should accept concurrency bound", () => {
			const concurrency = 3;
			let running = 0;

			return P
				.filter([1, 2, 3, 4], x => {
					running += 1;

					assert(running <= concurrency, "Too much concurrency!");

					return P
						.delay(5)
						.then(() => running -= 1)
						.return(x % 2);
				}, { concurrency })
				.then(res => assert.deepEqual(res, [1, 3]));
		});
	});

	describe(".reduce", () => {
		it("should take initial value", () => {
			return P
				.resolve([2, 3, 4])
				.reduce((y, x) => y + x, 1)
				.then(res => assert.strictEqual(res, 10));
		});

		it("should use first value as initial value when not provided", () => {
			return P
				.resolve([1, 2, 3, 4])
				.reduce((y, x) => y + x)
				.then(res => assert.strictEqual(res, 10));
		});

		it("should include same arguments as Array#reduce", () => {
			return P
				.resolve([2])
				.reduce((y, x, i, arr) => {
					assert.strictEqual(y, 1);
					assert.strictEqual(x, 2);
					assert.strictEqual(i, 0);
					assert.deepEqual(arr, [2]);
				}, 1);
		});

		it("should accept promise returning reducer and initial value", () => {
			return P
				.resolve([2, 3, 4])
				.map(x => P.resolve(x))
				.reduce((y, x) => y + x, P.resolve(1))
				.then(res => assert.strictEqual(res, 10));
		});

		it("should be available as a static method with initial value", () => {
			return P
				.reduce([2, 3, 4], (y, x) => y + x, 1)
				.then(res => assert.strictEqual(res, 10));
		});

		it("should be available as a static method without initial value", () => {
			return P
				.reduce([1, 2, 3, 4], (y, x) => y + x)
				.then(res => assert.strictEqual(res, 10));
		});
	});

	describe(".forEach", () => {
		it("should call method for each element in array", () => {
			const res = [];

			return P
				.resolve([1, 2, 3])
				.forEach(x => res.push(x))
				.then(() => assert.deepEqual(res, [1, 2, 3]));
		});

		it("should always return undefined", () => {
			return P
				.resolve([1, 2, 3])
				.forEach(x => x)
				.then(res => assert.strictEqual(res, undefined));
		});

		it("should run each iteration serially", () => {
			let ran = false;

			return P
				.resolve([1, 2])
				.forEach((x, i) => {
					switch (i) {
						case 0: return P.delay(10).then(() => ran = true);
						case 1: return assert.strictEqual(ran, true);
						default: throw new Error('forEach was called more times than expected.');
					}
				});
		});

		it("should be available as a static method", () => {
			return P
				.forEach([0, 1, 2], (x, i) => assert.strictEqual(x, i));
		});
	});
});
