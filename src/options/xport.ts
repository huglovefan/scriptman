import {documentLoaded} from "./all";

import Vue from "vue";
import xport from "./xport.vue";

documentLoaded()
	.then(() => new Vue({render: h => h(xport)}).$mount("#xport"));