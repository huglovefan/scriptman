interface CacheMapEntry <T> {
	timeout: number;
	value: T;
}

export default abstract class CacheMap <K, V> {
	
	private readonly map = new Map<K, CacheMapEntry<V>>();
	protected maxSize = 10;
	protected timeToLive = 10000;
	
	get (key: K) {
		if (this.map.has(key)) {
			const entry = this.map.get(key)!;
			clearTimeout(entry.timeout);
			entry.timeout = setTimeout(() => this.map.delete(key), this.timeToLive);
			return entry.value;
		}
		const value = this.getItem(key);
		this.map.set(key, {
			value: value,
			timeout: setTimeout(() => this.map.delete(key), this.timeToLive),
		});
		if (this.map.size > this.maxSize) {
			const keys = this.map.keys();
			do {
				const result = keys.next();
				if (result.done) break;
				const entry = this.map.get(result.value)!;
				clearTimeout(entry.timeout);
				this.map.delete(result.value);
			} while (this.map.size > this.maxSize);
		}
		return value;
	}
	
	protected abstract getItem (key: K): V;
}