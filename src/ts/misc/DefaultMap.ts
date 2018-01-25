export class DefaultMap <K, V> extends Map<K, V> {
	private readonly getItem: (key: K) => V;
	public constructor (getItem: (key: K) => V, entries?: ReadonlyArray<[K, V]>) {
		super(entries);
		this.getItem = getItem;
	}
	public get (key: K) {
		if (!this.has(key)) {
			this.set(key, this.getItem(key));
		}
		return super.get(key)!;
	}
}

export class DefaultWeakMap <K extends object, V> extends WeakMap<K, V> {
	private readonly getItem: (key: K) => V;
	public constructor (getItem: (key: K) => V, entries?: ReadonlyArray<[K, V]>) {
		super(entries);
		this.getItem = getItem;
	}
	public get (key: K) {
		if (!this.has(key)) {
			this.set(key, this.getItem(key));
		}
		return super.get(key)!;
	}
}