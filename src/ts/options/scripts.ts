import Vue from "vue";
import {documentLoaded} from "./all";
import scripts from "./scripts.vue";

const vue = new Vue({render: (h) => h(scripts)});

documentLoaded()
	.then(() => vue.$mount("#scripts"));