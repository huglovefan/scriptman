//
// old public api
//
// todo: remove
//

import {isBackgroundPage} from "../misc/isBackgroundPage";
import {Script} from "./Script";

console.assert(isBackgroundPage());

export interface ScriptManager {
	getAll (): PromiseLike<[string, Script][]>;
	get (id: string): PromiseLike<Script | undefined>;
	importStorage (storage: {[key: string]: any;}): PromiseLike<{[key: string]: any;}>;
}