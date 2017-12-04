import Vue from "vue";
import scripts from "./scripts.vue";
import {documentLoaded} from "./all";

const vue = new Vue({render: h => h(scripts)});

documentLoaded()
	.then(() => vue.$mount("#scripts"));