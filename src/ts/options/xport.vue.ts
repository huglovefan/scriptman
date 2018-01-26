import browser from "webextension-polyfill";
import {isPlainObject} from "../misc/isPlainObject";
import {ScriptManager} from "./scriptManagerRemote";

export default {
	data: () => {
		return {
			storageContents: "",
		};
	},
	methods: {
		async doImport (this: any) {
			const json = this.storageContents;
			try {
				const data = JSON.parse(json);
				if (!isPlainObject(data)) {
					throw new Error("Import data must be an object.");
				}
				await ScriptManager.importStorage(data);
			} catch (error) {
				console.error(error);
				alert("Import failed:\n\n" + error);
				return;
			}
			alert("Import successful.");
		},
		async doExport (this: any) {
			let storage;
			try {
				storage = await browser.storage.local.get();
			} catch (error) {
				console.error(error);
				alert("Export failed:\n\n" + error);
				return;
			}
			this.storageContents = JSON.stringify(storage, null, "    ");
		}
	}
};