import Vue from "vue";
import scripts from "./scripts.vue";
import {documentLoaded} from "./all";

const vue = new Vue({render: h => h(scripts)});

documentLoaded()
	.then(() => vue.$mount("#scripts"));

/**
 * if the page is being shown in the browser action popup
 *

const activeTab: Promise<chrome.tabs.Tab[]> | null =
	isPopup ?
		browser.tabs.query({active: true, currentWindow: true}) :
		null;

const activeTabUrl: Promise<URL> | null =
	activeTab !== null ?
		(async function () { return new URL((await activeTab)[0].url!); }()) :
		null;

//
//
//

const updateNoScriptsMessage = () => {
	const NO_SCRIPTS = "no-scripts";
	const scriptList = select("ul#scripts", document);
	const shouldShowMessage =
		scriptList.children.length === 0 ||
		[].every.call(scriptList.children, (c: HTMLElement) => c.hidden);
	if (shouldShowMessage) {
		scriptList.classList.add(NO_SCRIPTS);
	} else {
		scriptList.classList.remove(NO_SCRIPTS);
	}
};

async function main () {
	
	const scriptList = select("ul#scripts", document);
	const scripts = new Map<Script, HTMLElement>();
	for (const [id, script] of await scriptManager.getAll()) {
		const item = createScriptListItem(id, script);
		if (isPopup) {
			const url = await activeTabUrl!;
			if (url.protocol === "http:" || url.protocol === "https:") {
				item.hidden = !script.test(url);
			}
		}
		scriptList.appendChild(item);
		scripts.set(script, item);
	}
	scriptList.dataset.noScriptsMessage = "no scripts found";
	updateNoScriptsMessage();
	
	const search = select("input#search", document);
	const filterScriptsBy = (test: (script: Script) => boolean) => {
		for (const [script, element] of scripts) {
			element.hidden = !test(script);
		}
	};
	const showAllScripts = () => filterScriptsBy(() => true);
	const updateSearch = () => {
		
		const showMessage = (message: string) => {
			search.setCustomValidity(message);
			search.reportValidity();
		};
		const hideMessage = () => {
			search.setCustomValidity("");
		};
		
		const value = search.value.trim();
		
		if (value === "") {
			hideMessage();
			showAllScripts();
			return;
		}
		
		try {
			var url = new URL(value);
		} catch (error) {
			showMessage("Invalid URL");
			showAllScripts();
			return;
		}
		
		hideMessage();
		filterScriptsBy(script => script.test(url));
	};
	search.addEventListener("input", () => {
		updateSearch();
		updateNoScriptsMessage();
	});
	
	if (isPopup) {
		// don't open links in the popup
		document.head.append(createElement("base", {target: "_blank"}));
		
		const newLink = select("a#newLink", document);
		const params = new URLSearchParams(newLink.search);
		
		// get active tab url
		const [currentTab] = await activeTab!;
		const url = new URL(currentTab.url!);
		
		if (url.protocol !== "http:" && url.protocol !== "https:") {
			return;
		}
		
		search.value = hrefNoHash(url);
		
		params.set("from", url.hostname);
		newLink.search = String(params);
		
		const hostEncoded = encodeURIComponent(url.hostname);
		
		for (const item of selectAll<"a">("a.scriptListItem", document)) {
			console.assert(item.search.length > 1);
			item.search += "&from=" + hostEncoded;
		}
			
	}
}

documentLoaded()
	.then(main);

}

*/