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
				<div class="message" v-if="scripts !== null && scriptCount === 0">
					no scripts found
				</div>
				<li v-for="(script, id) in scripts"
					v-if="!tempHideAll && scripts !== null && scriptCount !== 0 && shouldShowScript(script)">
					<a v-bind:href="'editor.html?mode=edit&id=' + id">{{script.name}}</a>
				</li>
				<div class="message" v-if="scripts && scriptCount !== 0 && !hasVisibleScripts">
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

<script lang="ts" src="./scripts.vue.ts"></script>