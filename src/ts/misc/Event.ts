//
// like "chrome.Event" but better
//

import {identity, returnFalse, returnTrue} from "./functionConstants";
import {isReadonlyArray} from "./isReadonlyArray";

interface EventLike {
	addListener (callback: (...args: any[]) => any, x1: any, x2: any): void;
	addListener (callback: (...args: any[]) => any, x1: any): void;
	addListener (callback: (...args: any[]) => any): void;
	removeListener (callback: (...args: any[]) => any): void;
	hasListener (callback: (...args: any[]) => any): boolean;
}

type EventCallback <TValue, TResult = void> = (value: TValue) => TResult;

type TOrTArray <T> = T | ReadonlyArray<T>;

const combineFilterFunctions = (
	predicates: ReadonlyArray<((value: any) => boolean)>
) => {
	if (predicates.includes(returnFalse)) {
		return returnFalse;
	}
	const withoutNoop = predicates.filter((predicate) => {
		return predicate !== returnTrue;
	});
	if (withoutNoop.length === 0) {
		return returnTrue;
	}
	if (withoutNoop.length === 1) {
		return withoutNoop[0];
	}
	return (value: any) => {
		return withoutNoop.every((predicate) => {
			return predicate(value);
		});
	};
};

const combineMapFunctions = (
	mappers: ReadonlyArray<((value: any) => any)>
) => {
	const withoutIdentity = mappers.filter((mapper) => {
		return mapper !== identity;
	});
	if (withoutIdentity.length === 0) {
		return identity;
	}
	if (withoutIdentity.length === 1) {
		return withoutIdentity[0];
	}
	return (value: any) => {
		for (const mapper of withoutIdentity) {
			// tslint:disable-next-line:no-parameter-reassignment
			value = mapper(value);
		}
		return value;
	};
};

type ChromeEventBase = {
	removeListener: EventLike["removeListener"],
	hasListener: EventLike["hasListener"],
};
type ChromeEvent1 <V> = ChromeEventBase & {
	addListener (callback: (value: V) => any): any;
};
type ChromeEvent2 <V, X1> = ChromeEventBase & {
	addListener (callback: (value: V) => any, extra1: X1): any;
};
type ChromeEvent3 <V, X1, X2> = ChromeEventBase & {
	addListener (callback: (value: V) => any, extra1: X1, extra2: X2): any;
};

export class Event <V> {
	public static fromChromeEvent <V> (event: ChromeEvent1<V>): Event<V>;
	public static fromChromeEvent <V, X1> (event: ChromeEvent2<V, X1>, x1: X1): Event<V>;
	public static fromChromeEvent <V, X1, X2> (event: ChromeEvent3<V, X1, X2>, x1: X1, x2: X2): Event<V>;
	public static fromChromeEvent <V> (event: ChromeEvent1<V>, ...extra: any[]) {
		return new SubEvent<V>(event, extra);
	}
	private readonly listeners: EventCallback<V>[];
	public constructor () {
		this.listeners = [];
	}
	public addListener (callback: EventCallback<V>) {
		if (this.listeners.indexOf(callback) !== -1) {
			return;
		}
		this.listeners.push(callback);
	}
	public removeListener (callback: EventCallback<V>) {
		const i = this.listeners.indexOf(callback);
		if (i === -1) {
			return;
		}
		this.listeners.splice(i, 1);
	}
	public hasListener (callback: EventCallback<V>) {
		return this.listeners.indexOf(callback) !== -1;
	}
	public hasListeners () {
		return this.listeners.length !== 0;
	}
	public dispatch (value: V) {
		const listeners = this.listeners;
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < listeners.length; i++) {
			const callback = listeners[i];
			try {
				callback(value);
			} catch (error) {
				console.error(error);
			}
		}
	}
	public filter <V2 extends V> (
		predicate: TOrTArray<FilteredEvent<V, V2>["predicate"]>
	): Event<V2> {
		if (isReadonlyArray(predicate)) {
			return this.filter(combineFilterFunctions(predicate));
		}
		if (predicate === returnTrue) {
			return new SubEvent(this);
		}
		if (predicate === returnFalse) {
			return new Event();
		}
		return new FilteredEvent(this, predicate);
	}
	public map <V2> (mapper: TOrTArray<EventCallback<V, V2>>): Event<V2> {
		if (isReadonlyArray(mapper)) {
			return this.map(combineMapFunctions(mapper));
		}
		if (mapper === identity) {
			return new SubEvent(this);
		}
		return new MappedEvent(this, mapper);
	}
	// https://github.com/Microsoft/TypeScript/issues/14520
	public forwardTo (event: Event<V>) {
		this.addListener((value) => {
			event.dispatch(value);
		});
	}
	public absorb (event: TOrTArray<Event<V>>) {
		if (isReadonlyArray(event)) {
			for (const e of event) {
				this.absorb(e);
			}
			return;
		}
		event.forwardTo(this);
	}
}

class SubEvent <VParent, VThis = VParent> extends Event<VThis> {
	protected readonly parent: EventLike;
	protected attached: boolean;
	protected readonly extraArgs: ReadonlyArray<any>;
	public constructor (parent: Event<VParent>);
	public constructor (parent: EventLike, extraArgs: ReadonlyArray<any>);
	public constructor (parent: EventLike, extraArgs: ReadonlyArray<any> = []) {
		super();
		this.parent = parent;
		this.attached = false;
		this.extraArgs = extraArgs;
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
		if (this.attached && !this.hasListeners()) {
			this.detach();
			this.attached = false;
		}
	}
	protected callback (value: VParent) {
		this.dispatch(<VThis> <any> value);
	}
	protected attach () {
		// @ts-ignore
		this.parent.addListener(this.callback, ...this.extraArgs);
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