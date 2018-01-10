//
// Type definitions for zalgo-promise by krakenjs
// https://github.com/krakenjs/zalgo-promise/
//

declare module "zalgo-promise" {
	
	export class ZalgoPromise <R> implements PromiseLike<R> {
		
		public resolved: boolean;
		public rejected: boolean;
		public errorHandled: boolean;
		public value: R;
		public error: any;
		public handlers: {
			promise: ZalgoPromise<any>,
			onSuccess? (result: R): any,
			onError? (error: any): any,
		}[];
		public dispatching: boolean;
		
		public constructor (
			handler?: ((resolve: (result?: R) => void, reject: (error: any) => void) => void) | null
		);
		
		public resolve (result: R): ZalgoPromise<R>;
		
		public reject (error: any): ZalgoPromise<R>;
		
		public asyncReject (error: any): void;
		
		public dispatch (): void;
		
		// should be assignable to PromiseLike
		public then <X = R, Y = never> (
			onSuccess?: ((result: R) => (X | PromiseLike<X>)) | null,
			onError?: ((error: any) => (Y | PromiseLike<Y>)) | null
		): ZalgoPromise<X | Y>;
		
		public catch <X> (onError: (error: any) => (X | PromiseLike<X>)): ZalgoPromise<X>;
		
		public finally (handler: () => any): ZalgoPromise<R>;
		
		public timeout (time: number, err?: Error | null): ZalgoPromise<R>;
		
		public toPromise (): Promise<R>;
		
		public static resolve <X> (value: X | PromiseLike<X>): ZalgoPromise<X>;
		
		public static reject (error: any): ZalgoPromise<never>;
		
		// typescript also has 10 overloads for native Promise.all
		
		public static all <T1, T2, T3, T4, T5, T6, T7, T8, T9, T10> (promises: [(T1 | PromiseLike<T1>),
			(T2 | PromiseLike<T2>), (T3 | PromiseLike<T3>), (T4 | PromiseLike<T4>), (T5 | PromiseLike<T5>),
			(T6 | PromiseLike<T6>), (T7 | PromiseLike<T7>), (T8 | PromiseLike<T8>), (T9 | PromiseLike<T9>),
			(T10 | PromiseLike<T10>)]): ZalgoPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]>;
		public static all <T1, T2, T3, T4, T5, T6, T7, T8, T9> (promises: [(T1 | PromiseLike<T1>),
			(T2 | PromiseLike<T2>), (T3 | PromiseLike<T3>), (T4 | PromiseLike<T4>), (T5 | PromiseLike<T5>),
			(T6 | PromiseLike<T6>), (T7 | PromiseLike<T7>), (T8 | PromiseLike<T8>), (T9 | PromiseLike<T9>)]):
			ZalgoPromise<[T1, T2, T3, T4, T5, T6, T7, T8, T9]>;
		public static all <T1, T2, T3, T4, T5, T6, T7, T8> (promises: [(T1 | PromiseLike<T1>), (T2 | PromiseLike<T2>),
			(T3 | PromiseLike<T3>), (T4 | PromiseLike<T4>), (T5 | PromiseLike<T5>), (T6 | PromiseLike<T6>),
			(T7 | PromiseLike<T7>), (T8 | PromiseLike<T8>)]): ZalgoPromise<[T1, T2, T3, T4, T5, T6, T7, T8]>;
		public static all <T1, T2, T3, T4, T5, T6, T7> (promises: [(T1 | PromiseLike<T1>), (T2 | PromiseLike<T2>),
			(T3 | PromiseLike<T3>), (T4 | PromiseLike<T4>), (T5 | PromiseLike<T5>), (T6 | PromiseLike<T6>),
			(T7 | PromiseLike<T7>)]): ZalgoPromise<[T1, T2, T3, T4, T5, T6, T7]>;
		public static all <T1, T2, T3, T4, T5, T6> (promises: [(T1 | PromiseLike<T1>), (T2 | PromiseLike<T2>),
			(T3 | PromiseLike<T3>), (T4 | PromiseLike<T4>), (T5 | PromiseLike<T5>), (T6 | PromiseLike<T6>)]):
			ZalgoPromise<[T1, T2, T3, T4, T5, T6]>;
		public static all <T1, T2, T3, T4, T5> (promises: [(T1 | PromiseLike<T1>), (T2 | PromiseLike<T2>),
			(T3 | PromiseLike<T3>), (T4 | PromiseLike<T4>), (T5 | PromiseLike<T5>)]):
			ZalgoPromise<[T1, T2, T3, T4, T5]>;
		public static all <T1, T2, T3, T4> (promises: [(T1 | PromiseLike<T1>), (T2 | PromiseLike<T2>), (T3 | PromiseLike<T3>), (T4 | PromiseLike<T4>)]): ZalgoPromise<[T1, T2, T3, T4]>;
		public static all <T1, T2, T3> (promises: [(T1 | PromiseLike<T1>), (T2 | PromiseLike<T2>), (T3 | PromiseLike<T3>)]): ZalgoPromise<[T1, T2, T3]>;
		public static all <T1, T2> (promises: [(T1 | PromiseLike<T1>), (T2 | PromiseLike<T2>)]): ZalgoPromise<[T1, T2]>;
		public static all <T> (promises: [(T | PromiseLike<T>)]): ZalgoPromise<[T]>;
		
		public static all <X> (promises: (X | PromiseLike<X>)[]): ZalgoPromise<X[]>;
		
		public static hash <A> (promises: {[key: number]: (A | PromiseLike<A>)}): ZalgoPromise<{[key: number]: A}>;
		public static hash <A> (promises: {[key: string]: (A | PromiseLike<A>)}): ZalgoPromise<{[key: string]: A}>;
		
		public static map <T, X> (items: T[], method: (x: T) => (X | PromiseLike<X>)): ZalgoPromise<X[]>;
		
		public static onPossiblyUnhandledException (handler: (err: any) => any): {cancel (): void};
		
		public static try <X, C, A> (
			method: (...args: A[]) => (X | PromiseLike<X>),
			context?: C | null,
			args?: A[] | null
		): ZalgoPromise<X>;
		
		public static delay (delay: number): ZalgoPromise<void>;
		
		public static isPromise (value: any): value is PromiseLike<any>;
		
		public static flush (): ZalgoPromise<void>;
		
		public static flushQueue (): void;
		
	}
	
}