export abstract class CacheMap <K, V> {
	
	abstract readonly msTimeToLive: number;
	readonly maxSize: number | undefined;
	
	private map: Map<K, {timeoutId: number, value: V}>;
	
	constructor () {
		this.map = new Map();
		this.delete = this.delete.bind(this);
	}
	
	private delete (key: K) {
		const value = this.map.get(key);
		if (value === undefined) {
			return;
		}
		clearTimeout(value.timeoutId);
		this.map.delete(key);
	}
	
	get (key: K) {
		const value = this.map.get(key);
		if (value !== undefined) {
			return value.value;
		}
		const newValue = this.getItem(key);
		this.delete(key);
		this.map.set(key, {
			timeoutId: setTimeout(this.delete, this.msTimeToLive, key),
			value: newValue,
		});
		if (this.maxSize !== undefined && this.map.size > this.maxSize) {
			const iterator = this.map.keys();
			do {
				const {done, value} = iterator.next();
				if (done) {
					break;
				}
				this.delete(value);
			} while (this.map.size > this.maxSize)
		}
		return newValue;
	}
	
	protected abstract getItem (key: K): V;
}