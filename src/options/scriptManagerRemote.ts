import ScriptManager from "../background/ScriptManager";
import {getScriptManager} from "./all";

const scriptManagerPromise = getScriptManager();

let ScriptManagerRemote: ScriptManager = <any> new Proxy({}, {
	get: (_target, property, _receiver) =>
		async (...args: any[]) => {
			const scriptManager = await scriptManagerPromise;
			ScriptManagerRemote = scriptManager;
			return await (<any> scriptManager)[property](...args);
		},
});

export default ScriptManagerRemote;