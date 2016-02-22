"use strict";

class P extends Promise {
	constructor(fn) {
		super(fn);
	}

	return(val) {
		return this.then(() => val);
	}

	call(fn) {
		const args = new Array(arguments.length - 1);

		for (let i = 0; i < args.length; i++) {
			args[i] = arguments[i + 1];
		}

		return this.then(res => res[fn].apply(res, args));
	}

	delay(ms) {
		return this.then(res => new P(resolve => setTimeout(() => resolve(res), ms)));
	}

	tap(fn) {
		return this.then(res => {
			return P
				.resolve(fn(res))
				.then(() => res);
		});
	}

	map(fn) {
		return this.then(res => P.all(res.map(fn)));
	}

	filter(fn) {
		return this.then(res => {
			return P
				.all(res.map(fn))
				.then(filters => res.filter((_, i) => filters[i]));
		});
	}

	static promisify(fn, ctx) {
		return function promisifedMethod() {
			return new P((resolve, reject) => {
				const args = new Array(arguments.length + 1);

				args[arguments.length] = function promisifedMethodCallback(err) {
					if (err) {
						return reject(err);
					}

					if (arguments.length < 3) {
						return resolve(arguments[1]);
					}

					let res = new Array(arguments.length - 1);
					for (let i = 0; i < res.length; i++) {
						res[i] = arguments[i + 1];
					}

					return resolve(res);
				};

				for (let i = 0; i < arguments.length; i++) {
					args[i] = arguments[i];
				}

				fn.apply(ctx || this, args);
			});
		};
	}

	static fromCallback(fn) {
		return P.promisify(fn)();
	}

	// NOTE: Cannot use `util.inherits` with ES6 classes
	static extend(APromise) {
		// Instance methods
		Object
			.getOwnPropertyNames(P.prototype)
			.filter(k => k !== "constructor")
			.reduce((y, k) => Object.assign(y, {
				[k] : P.prototype[k]
			}), APromise.prototype);

		// Static methods
		return Object
			.getOwnPropertyNames(P)
			.filter(k => ["length", "name", "prototype"].indexOf(k) < 0)
			.reduce((y, k) => Object.assign(y, {
				[k] : P[k]
			}), APromise);
	}
}

module.exports = P;
