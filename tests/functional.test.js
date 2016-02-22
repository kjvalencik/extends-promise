"use strict";

const assert = require("assert");

const P = require("..");

const describe = global.describe;
const it = global.it;

describe("Functional", () => {
	it(".map: should map function resolved array", () => {
		return P
			.resolve([1, 2, 3])
			.map(x => x * 10)
			.then(res => assert.deepEqual(res, [10, 20, 30]));
	});

	it(".map: should wait for mapped promises to resolve", () => {
		return P
			.resolve([1])
			.map(x => P.resolve(x * 10))
			.then(res => assert.deepEqual(res, [10]));
	});

	it(".filter: should filter resolved array", () => {
		return P
			.resolve([1, 2, 3, 4])
			.filter(x => x % 2)
			.then(res => assert.deepEqual(res, [1, 3]));
	});

	it(".filter: should wait for async filter methods", () => {
		return P
			.resolve([1, 2, 3, 4])
			.filter(x => P.resolve(x % 2))
			.then(res => assert.deepEqual(res, [1, 3]));
	});
});
