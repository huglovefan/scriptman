//
// like "chrome.Event" but better
//

import {returnFalse, returnTrue} from "./returnConstants";

type EventCallback <TValue, TResult = void> = (value: TValue) => TResult;

export class Event <V> {
	protected readonly listeners: Set<EventCallback<V>>;
	public constructor () {
		this.listeners = new Set();
	}
	public addListener (callback: EventCallback<V>) {
		this.listeners.add(callback);
	}
	public removeListener (callback: EventCallback<V>) {
		this.listeners.delete(callback);
	}
	public hasListener (callback: EventCallback<V>) {
		return this.listeners.has(callback);
	}
	public dispatch (value: V) {
		for (const callback of [...this.listeners]) {
			try {
				callback(value);
			} catch (error) {
				console.error(error);
			}
		}
	}
	public filter <V2 extends V> (predicate: FilteredEvent<V, V2>["predicate"]): Event<V2> {
		if (predicate === returnTrue) {
			return new SubEvent(this);
		}
		if (predicate === returnFalse) {
			return new Event();
		}
		return new FilteredEvent(this, predicate);
	}
	public map <V2> (mapper: EventCallback<V, V2>): MappedEvent<V, V2> {
		return new MappedEvent(this, mapper);
	}
}

class SubEvent <VParent, VThis = VParent> extends Event<VThis> {
	protected readonly parent: Event<VParent>;
	protected attached: boolean;
	public constructor (parent: Event<VParent>) {
		super();
		this.parent = parent;
		this.attached = false;
		this.callback = this.callback.bind(this);
	}
	public addListener (callback: EventCallback<VThis>) {
		super.addListener(callback);
		if (!this.attached) {
			this.attach();
			this.attached = true;
		}
	}
	public removeListener (callback: EventCallback<VThis>) {
		super.removeListener(callback);
		if (this.attached && this.listeners.size === 0) {
			this.detach();
			this.attached = false;
		}
	}
	protected callback (value: VParent) {
		this.dispatch(<VThis> <any> value);
	}
	protected attach () {
		this.parent.addListener(this.callback);
	}
	protected detach () {
		this.parent.removeListener(this.callback);
	}
}

class FilteredEvent <V1, V2 extends V1> extends SubEvent<V1, V2> {
	private readonly predicate: ((value: V1) => value is V2) | EventCallback<V1, boolean>;
	public constructor (parent: Event<V1>, predicate: FilteredEvent<V1, V2>["predicate"]) {
		super(parent);
		this.predicate = predicate;
	}
	protected callback (value: V1) {
		if (!this.predicate(value)) {
			return;
		}
		this.dispatch(value);
	}
}

class MappedEvent <V1, V2> extends SubEvent<V1, V2> {
	private readonly mapper: (value: V1) => V2;
	public constructor (parent: Event<V1>, mapper: MappedEvent<V1, V2>["mapper"]) {
		super(parent);
		this.mapper = mapper;
	}
	protected callback (value: V1) {
		this.dispatch(this.mapper(value));
	}
}