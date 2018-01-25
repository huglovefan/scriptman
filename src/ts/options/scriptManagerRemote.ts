import {ScriptManager} from "../background/ScriptManager";
import {isBackgroundPage} from "../misc/isBackgroundPage";
import {getScriptManager} from "./all";

console.assert(!isBackgroundPage());

let ScriptManagerRemote: ScriptManager = <any> new Proxy({}, {
	get: (_target, property, _receiver) =>
		(...args: any[]) =>
			scriptManagerPromise.then((scriptManager) =>
				(<any> scriptManager)[property](...args))});

const scriptManagerPromise = getScriptManager().then((scriptManager) => {
	ScriptManagerRemote = scriptManager;
	return scriptManager;
});

export {ScriptManagerRemote as ScriptManager};