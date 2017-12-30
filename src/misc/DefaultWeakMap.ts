// stolen from mozilla
export default class DefaultWeakMap <K extends object, V> extends WeakMap<K, V> {
	private readonly callback: (key: K) => V;
	public constructor (callback: DefaultWeakMap<K, V>["callback"]) {
		super();
		this.callback = callback;
	}
	public get (key: K) {
		if (super.has(key)) {
			return super.get(key)!;
		}
		const item = <V> this.callback.call(null, key);
		super.set(key, item);
		return item;
	}
}