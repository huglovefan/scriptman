import {getScriptManager} from "./all";
import {ScriptManager} from "../background/ScriptManager";

let scriptManagerPromise = getScriptManager();

let scriptManager: ScriptManager = <any> new Proxy({}, {
	get: (_target, property, _receiver) =>
		async (...args: any[]) =>
			(<any> (scriptManager = await scriptManagerPromise))[property](...args),
});

export default scriptManager;