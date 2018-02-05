import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import {Script} from "../background/Script";
import {canRunScripts} from "../misc/canRunScripts";
import {entriesToObject} from "../misc/entriesToObject";
import {escapeRegExp} from "../misc/escapeRegExp";
import {FRAME_ID_TOP} from "../misc/FRAME_ID_TOP";
import {returnTrue} from "../misc/functionConstants";
import {hrefNoHash} from "../misc/hrefNoHash";
import {ReadonlyURL} from "../misc/ReadonlyURL";
import {createElement} from "./all";
import {ScriptManager} from "./scriptManagerRemote";

const isPopup = (() => {
	const params = new URLSearchParams(location.search);
	return Boolean(Number(params.get("popup") || "0") || 0);
})();

if (isPopup) {
	document.documentElement.classList.add("popup");
	document.head.append(createElement("base", {target: "_blank"}));
}

const activeTabPromise =
	isPopup &&
	new ZalgoPromise<chrome.tabs.Tab[]>((resolve, reject) => {
		browser.tabs.query({active: true, currentWindow: true}).then(resolve, reject);
	})
	.then((tabs) => {
		if (tabs.length !== 1) {
			throw new Error("Failed to get current tab");
		}
		return tabs[0];
	});
const activeTabURLPromise =
	activeTabPromise && activeTabPromise.then((tab) => {
		return new ReadonlyURL(tab.url!);
	});
const activeTabCanRunPromise =
	activeTabPromise && activeTabPromise.then((tab) => {
		return canRunScripts(tab.id!, FRAME_ID_TOP);
	});

const allScriptsPromise =
	ScriptManager.getAll()
		.then((entries) => entriesToObject([...entries]));

const getSearchPredicate = (type: string, value: string) => {
	if (type === "name") {
		const pattern =
			"^" +
			value.split(/\s+/)
				.map((word) => `(?=.*?${escapeRegExp(word)})`)
				.join("");
		const re = RegExp(pattern, "ui");
		return (script: Script) => re.test(script.name);
	}
	if (type === "url") {
		const url = new ReadonlyURL(value);
		return (script: Script) => script.test(url);
	}
	throw new Error(`Unknown filter type ${type}`);
};

export default {
	data () {
		return {
			isPopup, // to use it in the template
			scripts: null,
			search: "",
			searchType: isPopup ? "url" : "name",
			searchPredicate: returnTrue,
			searchPlaceholders: {
				name: "my cool script",
				url: "https://example.org/",
			},
			hasVisibleScripts: false,
			// hide all scripts until the popup & active tab url have loaded,
			// to prevent showing all and making the popup bigger than needed
			tempHideAll: isPopup,
			scriptCount: -1,
		};
	},
	created (this: any) {
		if (isPopup && activeTabURLPromise) {
			ZalgoPromise.all([activeTabURLPromise, activeTabCanRunPromise])
				.then(([url, canRun]) => {
					if (canRun) {
						this.search = hrefNoHash(url);
						this.updateSearch();
					}
					this.tempHideAll = false;
				});
		}
		allScriptsPromise
			.then((scripts) => {
				// the script instances persist on the background page,
				// so having vue make them reactive causes a memory leak
				Object.freeze(scripts);
				this.scripts = scripts;
				this.scriptCount = Object.keys(scripts).length;
			});
	},
	methods: {
		searchTypeChanged (this: any) {
			this.search = "";
			this.updateSearch();
		},
		updateSearch (this: any) {
			this.hasVisibleScripts = false;
			try {
				this.searchPredicate = getSearchPredicate(this.searchType, this.search);
			} catch (error) {
				console.error(error);
				this.searchPredicate = returnTrue;
				// todo: show an error message
			}
		},
		shouldShowScript (this: any, script: Script) {
			const result = this.searchPredicate(script);
			if (result) {
				this.hasVisibleScripts = true;
			}
			return result;
		}
	}
};