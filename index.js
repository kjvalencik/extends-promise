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

	tap(fn) {
		return this.then(res => {
			return P
				.resolve(fn(res))
				.then(() => res);
		});
	}

	toCallback(cb) {
		return this
			.then(res => cb(null, res))
			.catch(err => cb(err));
	}

	delay(ms) {
		return this.then(res => new P(resolve => setTimeout(() => resolve(res), ms)));
	}

	map(fn, opts) {
		const concurrency = opts && opts.concurrency;

		if (typeof concurrency !== "number" || !isFinite(concurrency) || concurrency < 1) {
			return this.then(res => P.all(res.map(fn)));
		}

		return this.then(res => {
			const ds = res.map(P.defer);
			let i = concurrency;

			ds.slice(0, concurrency).forEach(d => d.resolve());

			return P.all(res.map((x, j) => {
				return ds[j].promise
					.then(() => fn(x, j, res))
					.tap(() => ds[i] && ds[i++].resolve());
			}));
		});
	}

	filter(fn, opts) {
		return this
			.map((x, i, a) => P.all([fn(x, i, a), x]), opts)
			.then(res => res.filter(t => t[0]).map(t => t[1]));
	}

	reduce(fn, initialValue) {
		const reducer = (y, x, i, a) => P.resolve(y).then(z => fn(z, x, i, a));
		const args = arguments.length > 1 ? [reducer, initialValue] : [reducer];

		return this.then(res => res.reduce.apply(res, args));
	}

	forEach(fn) {
		return this
			.reduce((y, x, i, a) => fn(x, i, a), null)
			.return(undefined);
	}

	// Methods should also be available as static
	static defer() {
		let resolve = null;
		let reject = null;

		const promise = new P((res, rej) => {
			resolve = res;
			reject = rej;
		});

		return { resolve, reject, promise };
	}

	static delay(ms, val) {
		return P.resolve(val).delay(ms);
	}

	static map(val, fn, opts) {
		return P.resolve(val).map(fn, opts);
	}

	static filter(val, fn, opts) {
		return P.resolve(val).filter(fn, opts);
	}

	static reduce(val, fn, initialValue) {
		const p = P.resolve(val);

		return arguments.length > 2 ? p.reduce(fn, initialValue) : p.reduce(fn);
	}

	static forEach(val, fn) {
		return P.resolve(val).forEach(fn);
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
