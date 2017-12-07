import {documentLoaded} from "./all";

import Vue from "vue";
import xport from "./xport.vue";

const vue = new Vue({render: (h) => h(xport)});

documentLoaded()
	.then(() => vue.$mount("#xport"));