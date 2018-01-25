import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import {isBackgroundPage} from "../misc/isBackgroundPage";
import {BadgeManager} from "./BadgeManager";
import {fixupAndApplyStorage} from "./fixupAndApplyStorage";
import {dispatchOldNavigations} from "./onNavigated";
import {ScriptInit} from "./Script";
import {ScriptManager} from "./ScriptManager";
import {ScriptStore} from "./ScriptStore";

console.assert(isBackgroundPage());

export interface BackgroundPageWindow extends Window {
	BadgeManager?: BadgeManager;
	ScriptManager?: ScriptManager;
}

type Storage = {[key: string]: any};

(<Promise<Storage>> browser.storage.local.get())
	.then(fixupAndApplyStorage)
	.then(() => {
		const scriptStore = new ScriptStore();
		const badgeManager = new BadgeManager(scriptStore);
		(<BackgroundPageWindow> window).BadgeManager = badgeManager;
		return scriptStore.init();
	})
	.then((scriptStore) => {
		(<BackgroundPageWindow> window).ScriptManager = {
			get: (id: string) => ZalgoPromise.resolve(scriptStore.getScript(id) || undefined),
			getAll: () => ZalgoPromise.resolve(scriptStore.getAllScripts()),
			getRaw: async (id: string) => {
				const storage = <any> await browser.storage.local.get(id);
				return <ScriptInit | undefined> storage[id];
			},
			importStorage: (storage: Storage) => fixupAndApplyStorage(storage, true),
		};
		dispatchOldNavigations();
	});