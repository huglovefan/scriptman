export default <
	K extends string,
	V,
	R extends {[key in K]?: any} // is this useful?
> (
	key: K,
	getValue: (this: R, key: K) => V
) => {
	return {
		get: function (this: R) {
			delete this[key];
			const value = <V> getValue.call(this, key);
			this[key] = value;
			return value;
		},
		set: function (this: R, value: V) {
			delete this[key];
			this[key] = value;
		},
		configurable: true,
		enumerable: true,
	};
};