<template>
	<div id="editor">
		<fieldset name="editor">
			<label class="row">
				<div class="label">name</div>
				<input type="text" name="scriptName">
			</label>
			<label class="row">
				<input type="checkbox" name="scriptEnabled" checked> <span class="label">enabled</span>
			</label>
			<div class="row">
				<div name="sectionArea"></div>
				<button name="addSection">add section</button>
			</div>
			<div class="row">
				<div class="label">actions</div>
				<button name="saveScript">save</button>
				<button name="deleteScript">delete</button>
			</div>
		</fieldset>
	</div>
</template>

<script lang="ts">
	export default {
		created () {
			import("./editormain.ts");
		},
	};
</script>