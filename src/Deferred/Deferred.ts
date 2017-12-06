export default class Deferred <T = void> extends Promise<T> {
	
	// without this, it throws:
	// Promise resolve or reject function is not callable
	// should investigate? i thought this was compatible with promises
	static get [Symbol.species] () {
		return Promise;
	}
	
	// @ts-ignore not definitely assigned
	private resolve_: (value?: T | PromiseLike<T> | undefined) => void;
	// @ts-ignore
	private reject_: (reason?: any) => void;
	private done_: boolean;
	
	constructor () {
		let res_, rej_;
		super((res, rej) => {
			res_ = res;
			rej_ = rej;
		});
		// @ts-ignore
		this.resolve_ = res_;
		// @ts-ignore
		this.reject_ = rej_;
		this.done_ = false;
	}
	
	resolve (value?: T | PromiseLike<T> | undefined): Promise<T> {
		if (this.done_) {
			// @ts-ignore cryptic error
			return this.then(() => value);
		} else {
			this.resolve_(value);
			this.done_ = true;
			// @ts-ignore not assignable
			this.resolve_ = this.reject_ = Function.prototype;
			return this;
		}
	}
	
	reject (reason: any): Promise<T> {
		if (this.done_) {
			return this.then(() => {
				throw reason;
			});
		} else {
			this.reject_(reason);
			this.done_ = true;
			// @ts-ignore not assignable
			this.resolve_ = this.reject_ = Function.prototype;
			return this;
		}
	}
	
	get done () {
		return this.done_;
	}
}