import {getScriptManager} from "./all";
import ScriptManager from "../background/ScriptManager";

let scriptManagerPromise = getScriptManager();

let ScriptManagerRemote: ScriptManager = <any> new Proxy({}, {
	get: (_target, property, _receiver) =>
		async (...args: any[]) =>
			(<any> (ScriptManagerRemote = await scriptManagerPromise))[property](...args),
});

export default ScriptManagerRemote;