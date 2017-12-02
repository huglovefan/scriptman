import {ScriptManager} from "./ScriptManager";

export interface BackgroundPageWindow extends Window {
	scriptManager?: ScriptManager;
}

export const FRAME_ID_TOP = 0;