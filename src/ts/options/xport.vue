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

<script lang="ts" src="./xport.vue.ts"></script>