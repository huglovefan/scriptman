import {documentLoaded} from "./all";

import Vue from "vue";
import editor from "./editor.vue";

const vue = new Vue({render: h => h(editor)});

documentLoaded()
	.then(() => vue.$mount("#editor"));