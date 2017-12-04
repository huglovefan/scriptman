import BadgeManager from "./BadgeManager";
import ScriptManager from "./ScriptManager";

export interface BackgroundPageWindow extends Window {
	ScriptManager?: ScriptManager;
}

export const FRAME_ID_TOP = 0;

new BadgeManager();
ScriptManager.init();