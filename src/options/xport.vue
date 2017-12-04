<template>
	<div id="xport">
		<div class="row">
			<textarea rows="15" spellcheck="false" v-model="storageContents"></textarea>
		</div>
		<div class="row">
			<button @click="doImport">import</button>
			<button @click="doExport">export</button>
		</div>
	</div>
</template>

<script lang="ts">
	import browser from "webextension-polyfill";
	import ScriptManager from "./scriptManagerRemote";
	export default {
		data: function () {
			return {
				storageContents: "",
			};
		},
		methods: {
			async doImport (this: any) {
				const json = this.storageContents;
				try {
					const data = JSON.parse(json);
					if (Object.prototype.toString.call(data) !== "[object Object]") {
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
				try {
					var storage = await browser.storage.local.get();
				} catch (error) {
					console.error(error);
					alert("Export failed:\n\n" + error);
					return;
				}
				this.storageContents = JSON.stringify(storage, null, "    ");
			}
		}
	};
</script>