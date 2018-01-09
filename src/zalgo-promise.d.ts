// https://github.com/krakenjs/zalgo-promise/blob/master/src/promise.js
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
		public constructor (handler?: (resolve: (result?: R) => void, reject: (error: any) => void) => void);
		public resolve (result: R): ZalgoPromise<R>;
		public reject (error: any): ZalgoPromise<R>;
		public asyncReject (error: any): void;
		public dispatch (): void;
		// should be assignable to PromiseLike
		public then <X extends any = R, Y extends any = never> (
			onSuccess?: null | ((result: R) => (ZalgoPromise<X> | PromiseLike<X> | X)),
			onError?: null | ((error: any) => (ZalgoPromise<Y> | PromiseLike<Y> | Y))
		): ZalgoPromise<X | Y>;
		public catch <X extends any = any> (onError: (error: any) => (ZalgoPromise<X> | X)): ZalgoPromise<X>;
		public finally (handler: () => any): ZalgoPromise<R>;
		public timeout (time: number, err?: Error): ZalgoPromise<R>;
		public toPromise (): Promise<R>;
		public static resolve <X extends any = any> (value: X | ZalgoPromise<X>): ZalgoPromise<X>;
		public static reject <x extends any = any> (error: any): ZalgoPromise<x>;
		
		public static all <A> (promises: [(A | PromiseLike<A>)]): ZalgoPromise<[A]>;
		public static all <A, B> (promises: [(A | PromiseLike<A>), (B | PromiseLike<B>)]): ZalgoPromise<[A, B]>;
		public static all <A, B, C>
			(promises: [(A | PromiseLike<A>), (B | PromiseLike<B>), (C | PromiseLike<C>)]): ZalgoPromise<[A, B, C]>;
		public static all <X extends any = any> (promises: (X | PromiseLike<X>)[]): ZalgoPromise<X[]>;
		
		public static hash <
			A = any
		> (
			promises: {[key: string]: (A | PromiseLike<A>)}
		): ZalgoPromise<{[key: string]: A}>;
		public static map <T, X> (items: T[], method: (x: T) => ZalgoPromise<X> | X): ZalgoPromise<X[]>;
		public static onPossiblyUnhandledException (handler: (err: any) => any): {cancel (): void};
		public static try <X, C, A> (
			method: (...args: A[]) => (ZalgoPromise<X> | X),
			context?: C,
			args?: A[]
		): ZalgoPromise<X>;
		public static delay (delay: number): ZalgoPromise<void>;
		public static isPromise (value: any): value is (Promise<any> | ZalgoPromise<any>);
		public static flush (): ZalgoPromise<void>;
		public static flushQueue (): void;
	}
}