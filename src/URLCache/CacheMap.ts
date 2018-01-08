interface CacheMapEntry <T> {
	timeout: number;
	value: T;
}

export interface CacheMapOptions {
	maxSize: number;
	timeToLive: number;
}

const defaultOptions: Readonly<CacheMapOptions> = {
	maxSize: 10,
	timeToLive: 1000,
};

export default class CacheMap <K, V> {
	
	private static getOption <K extends keyof CacheMapOptions>
	(options: Partial<CacheMapOptions> | undefined, key: K): CacheMapOptions[K] {
		if (options === void 0 || options[key] === void 0) {
			return defaultOptions[key];
		}
		return options[key]!;
	}
	
	private readonly map = new Map<K, CacheMapEntry<V>>();
	private readonly getItem: (key: K) => V;
	private readonly maxSize: number;
	private readonly timeToLive: number;
	
	public constructor (getItem: CacheMap<K, V>["getItem"], options?: Partial<CacheMapOptions>) {
		this.getItem = getItem;
		this.maxSize = CacheMap.getOption(options, "maxSize");
		this.timeToLive = CacheMap.getOption(options, "timeToLive");
	}
	
	public get (key: K) {
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
}