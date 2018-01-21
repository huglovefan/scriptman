<template>
	<div id="scripts">
		<div class="row" id="searchrow">
			<select v-model="searchType" v-if="!isPopup" @change="searchTypeChanged" v-bind:disabled="!scripts">
				<option value="name">name contains</option>
				<option value="url">matches url</option>
			</select>
			<input type="search" spellcheck="false" v-model="search" v-bind:placeholder="searchPlaceholders[searchType]" v-bind:disabled="!scripts" @input="updateSearch">
		</div>
		<div class="row">
			<ul>
				<div class="message" v-if="scripts === null">
					loading...
				</div>
				<div class="message" v-if="scripts !== null && scriptCount() === 0">
					no scripts found
				</div>
				<li v-for="(script, id) in scripts"
					v-if="!tempHideAll && scripts !== null && scriptCount() !== 0 && shouldShowScript(script)">
					<a v-bind:href="'editor.html?mode=edit&id=' + id">{{script.name}}</a>
				</li>
				<div class="message" v-if="scripts && scriptCount() !== 0 && !hasVisibleScripts">
					no matching scripts
				</div>
			</ul>
		</div>
		<div class="row">
			<a href="editor.html?mode=new" id="newLink">new script</a>
			<a href="xport.html">import / export</a>
		</div>
	</div>
</template>

<script lang="ts">
	import ScriptManager from "./scriptManagerRemote";
	import browser from "webextension-polyfill";
	import hrefNoHash from "../misc/hrefNoHash";
	import escapeRegExp from "../misc/escapeRegExp";
	import entriesToObject from "../misc/entriesToObject";
	import canRunScripts from "../misc/canRunScripts";
	import {Script} from "../background/Script";
	import FRAME_ID_TOP from "../misc/FRAME_ID_TOP";
	import {createElement} from "./all";
	import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";
	
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
		(<Promise<chrome.tabs.Tab[]>> browser.tabs.query({active: true, currentWindow: true}))
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
			.then(entries => entriesToObject([...entries]));
	
	export default {
		data () {
			return {
				isPopup, // to use it in the template
				scripts: null,
				search: "",
				searchType: isPopup ? "url" : "name",
				searchURL: null,
				searchRegex: null,
				searchPlaceholders: {
					name: "my cool script",
					url: "https://example.org/",
				},
				hasVisibleScripts: false,
				// hide all scripts until the popup & active tab url have loaded,
				// to prevent showing all and making the popup bigger than needed
				tempHideAll: isPopup,
			};
		},
		created (this: any) {
			if (isPopup && activeTabURLPromise) {
				Promise.all([activeTabURLPromise, activeTabCanRunPromise])
					.then(([url, canRun]) => {
						if (canRun) {
							this.search = hrefNoHash(url);
							this.updateSearch();
						}
						this.tempHideAll = false;
					});
			}
			allScriptsPromise
				.then(scripts => {
					// the script instances persist on the background page,
					// so having vue make them reactive causes a memory leak
					Object.freeze(scripts);
					this.scripts = scripts;
				});
		},
		methods: {
			scriptCount (this: any) {
				return Object.keys(this.scripts).length;
			},
			searchTypeChanged (this: any) {
				this.search = "";
				this.updateSearch();
			},
			updateSearch (this: any) {
				this.hasVisibleScripts = false;
				switch (this.searchType) {
					case "url":
						if (!this.search) {
							this.searchURL = null;
							break;
						}
						try {
							this.searchURL = new URL(this.search);
						} catch (error) {
							this.searchURL = null;
							// todo: show an error message
						}
						break;
					case "name":
						try {
							this.searchRegex = RegExp(
								this.search.split(/\s+/)
									.map((w: string) => `(?=.*?${escapeRegExp(w)})`)
									.join("")
							, "ui");
						} catch (error) {
							this.searchRegex = null;
							// todo: show an error message
						}
						break;
				}
			},
			shouldShowScript (this: any, script: Script) {
				const result =
					(this.searchType === "url") ?
						(!this.searchURL || script.test(this.searchURL)) :
					(this.searchType === "name") ?
						(!this.searchRegex || this.searchRegex.test(script.name)) :
					true;
				if (result) {
					this.hasVisibleScripts = true;
				}
				return result;
			}
		}
	};
</script>