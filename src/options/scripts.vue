<template>
	<div id="scripts">
		<div class="row" id="searchrow">
			<select v-model="searchType" v-if="!isPopup" @change="searchTypeChanged" v-bind:disabled="!scripts">
				<option value="name">name contains</option>
				<option value="url">matches url</option>
			</select>
			<input type="search" v-model="search" spellcheck="false" v-bind:placeholder="searchPlaceholders[searchType]" v-bind:disabled="!scripts" @input="updateSearch">
		</div>
		<div class="row">
			<ul>
				<div class="message" v-if="!scripts">
					loading...
				</div>
				<div class="message" v-if="scripts && !Object.keys(scripts).length">
					no scripts found
				</div>
				<li v-if="scripts && Object.keys(scripts).length && shouldShowScript(script)" v-for="(script, id) in scripts">
					<a v-bind:href="'editor.html?id=' + id">{{script.name}}</a>
				</li>
				<div class="message" v-if="scripts && Object.keys(scripts).length && !hasVisibleScripts">
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
	import scriptManager from "./scriptManagerRemote";
	import browser from "webextension-polyfill";
	import {hrefNoHash, escapeRegExp} from "../misc";
	import {Script} from "../background/Script";
	import {createElement} from "./all";
	export default {
		data () {
			const isPopup = (() => {
				const params = new URLSearchParams(location.search);
				return Boolean(Number(params.get("popup") || "0") || 0);
			})();
			return {
				isPopup,
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
			};
		},
		async created (this: any) {
			if (this.isPopup) {
				document.documentElement.classList.add("popup");
				document.head.append(createElement("base", {target: "_blank"}));
				browser.tabs.query({active: true, currentWindow: true})
					.then((tabs: chrome.tabs.Tab[]) => {
						const url = new URL(tabs[0].url!);
						if (/^https?:$/.test(url.protocol)) {
							this.search = hrefNoHash(url);
							this.updateSearch();
						}
					});
			}
			scriptManager.getAll()
				.then(entries => {
					this.scripts =
						[...entries]
						.reduce((res, [id, init]) => Object.assign(res, {[id]: init}), {})
				});
		},
		methods: {
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
							// error message
						}
						break;
					case "name":
						try {
							this.searchRegex = RegExp(
								this.search.split(/\s+/).map(escapeRegExp).join(".*")
							, "ui");
						} catch (error) {
							this.searchRegex = null;
							// error message
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