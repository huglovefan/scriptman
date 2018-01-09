import ScriptManager from "../background/ScriptManager";
import {getScriptManager} from "./all";

const scriptManagerPromise = getScriptManager().then((scriptManager) => {
	ScriptManagerRemote = scriptManager;
	return scriptManager;
});

let ScriptManagerRemote: ScriptManager = <any> new Proxy({}, {
	get: (_target, property, _receiver) =>
		(...args: any[]) =>
			scriptManagerPromise.then((scriptManager) =>
				(<any> scriptManager)[property](...args))});

export default ScriptManagerRemote;