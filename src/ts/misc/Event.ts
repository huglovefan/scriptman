import {returnFalse, returnTrue} from "./returnConstants";

type EventCallback <TValue, TResult = void> = (value: TValue) => TResult;

export class Event <T> {
	public static combine <T> (...events: Event<T>[]) {
		const result = new Event<T>();
		const dispatch = <Event<T>["dispatch"]> result.dispatch.bind(result);
		for (const event of events) {
			event.addListener(dispatch);
		}
		return result;
	}
	protected readonly listeners: Set<EventCallback<T>>;
	public constructor () {
		this.listeners = new Set();
	}
	public addListener (callback: EventCallback<T>) {
		this.listeners.add(callback);
	}
	public removeListener (callback: EventCallback<T>) {
		this.listeners.delete(callback);
	}
	public hasListener (callback: EventCallback<T>) {
		return this.listeners.has(callback);
	}
	public dispatch (value: T) {
		for (const callback of [...this.listeners]) {
			try {
				callback(value);
			} catch (error) {
				console.error(error);
			}
		}
	}
	public map <T2> (callback: EventCallback<T, T2>) {
		const event = new Event<T2>();
		this.addListener((value) => {
			event.dispatch(callback(value));
		});
		return event;
	}
	public filter <T2 extends T> (callback: ((value: T) => value is T2) | EventCallback<T, boolean>): Event<T2> {
		const event = new Event<T2>();
		if (callback === returnTrue) {
			this.addListener(<Event<T>["dispatch"]> event.dispatch.bind(event));
		} else if (callback !== returnFalse) {
			this.addListener((value) => {
				if (!callback(value)) {
					return;
				}
				event.dispatch(value);
			});
		}
		return event;
	}
}