import {select, documentLoaded} from "./all";
import browser from "webextension-polyfill";
import scriptManager from "./scriptManagerRemote";

select; // not unused

{

function select (selector: "button#export", scope: Document): HTMLButtonElement;
function select (selector: "button#import", scope: Document): HTMLButtonElement;
function select (selector: "textarea#data", scope: Document): HTMLTextAreaElement;

// @ts-ignore
function main () {
	select("button#export", document).addEventListener("click", async function () {
		try {
			var storage = await browser.storage.local.get();
		} catch (error) {
			console.error(error);
			alert("Export failed:\n\n" + error);
			return;
		}
		const result = JSON.stringify(storage, null, "    ");
		select("textarea#data", document).value = result;
	});
	select("button#import", document).addEventListener("click", async function () {
		const json = select("textarea#data", document).value;
		try {
			const data = JSON.parse(json);
			if (Object.prototype.toString.call(data) !== "[object Object]") {
				throw new Error("Import data must be an object.");
			}
			await scriptManager.importStorage(data);
		} catch (error) {
			console.error(error);
			alert("Import failed:\n\n" + error);
			return;
		}
		alert("Import successful.");
	});
}

documentLoaded()
	.then(main);

}