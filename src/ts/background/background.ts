import isBackgroundPage from "../misc/isBackgroundPage";
import BadgeManager from "./BadgeManager";
import ScriptManager from "./ScriptManager";

console.assert(isBackgroundPage());

export interface BackgroundPageWindow extends Window {
	BadgeManager?: BadgeManager;
	ScriptManager?: ScriptManager;
}

(<BackgroundPageWindow> window).BadgeManager = new BadgeManager();
ScriptManager.init();