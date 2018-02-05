import browser from "webextension-polyfill";
import {isPlainObject} from "../misc/isPlainObject";
import {once} from "../misc/once";
import {documentLoaded, sel} from "./all";
import {ScriptManager} from "./scriptManagerRemote";

const textarea = once(() => sel("textarea", "#textarea", document));

const doImport = async () => {
	const json = textarea().value;
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
};
const doExport = async () => {
	let storage;
	try {
		storage = await browser.storage.local.get();
	} catch (error) {
		console.error(error);
		alert("Export failed:\n\n" + error);
		return;
	}
	textarea().value = JSON.stringify(storage, null, "    ");
};

documentLoaded().then(() => {
	sel("button", "#import", document).addEventListener("click", doImport);
	sel("button", "#export", document).addEventListener("click", doExport);
});