import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import {isBackgroundPage} from "../misc/isBackgroundPageWindow";
import {BadgeManager} from "./BadgeManager";
import {fixupAndApplyStorage} from "./fixupAndApplyStorage";
import {dispatchOldNavigations} from "./onNavigated";
import {ScriptManager} from "./ScriptManager";
import {ScriptStore} from "./ScriptStore";

console.assert(isBackgroundPage());

export interface BackgroundPageWindow extends Window {
	BadgeManager?: BadgeManager;
	ScriptManager?: ScriptManager;
	ScriptStore?: ScriptStore;
}

type Storage = {[key: string]: any};

(async () => {
	
	try {
		const storage = <Storage> await browser.storage.local.get();
		await fixupAndApplyStorage(storage);
	} catch (error) {
		console.error(error);
	}
	
	const scriptStore = new ScriptStore();
	(<BackgroundPageWindow> window).ScriptStore = scriptStore;
	const badgeManager = new BadgeManager(scriptStore);
	(<BackgroundPageWindow> window).BadgeManager = badgeManager;
	await scriptStore.init();
	
	(<BackgroundPageWindow> window).ScriptManager = {
		get: (id: string) => {
			return ZalgoPromise.resolve(scriptStore.getScript(id));
		},
		getAll: () => {
			return ZalgoPromise.resolve(scriptStore.getAllScripts());
		},
		importStorage: (storage: Storage) => {
			return fixupAndApplyStorage(storage, true);
		},
	};
	dispatchOldNavigations();
	
})().catch((error) => {
	console.error(error);
});