import {ScriptManager} from "../background/ScriptManager";
import {isBackgroundPage} from "../misc/isBackgroundPage";
import {getScriptManager} from "./all";

console.assert(!isBackgroundPage());

// this module assumes all methods of ScriptManager return a promise

type ScriptManagerRemote = {[K in keyof ScriptManager]: (...args: any[]) => Promise<any>};

let ScriptManagerRemote: ScriptManager = <ScriptManagerRemote> new Proxy({}, {
	get: (_target, property, _receiver) => {
		return (...args: any[]) => {
			return scriptManagerPromise.then((scriptManager) => {
				return (<any> scriptManager)[property](...args);
			});
		};
	},
});

const scriptManagerPromise = getScriptManager().then((scriptManager) => {
	ScriptManagerRemote = scriptManager;
	return scriptManager;
});

export {ScriptManagerRemote as ScriptManager};