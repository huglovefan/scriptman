import {Section, AnySectionInit, AnySection} from "./Section";
import {ReadonlyURL} from "./ReadonlyURL";

export interface ScriptInit {
	name: string;
	enabled: boolean;
	sections: ReadonlyArray<AnySectionInit>;
}

export class Script {
	
	readonly name: string;
	readonly enabled: boolean;
	readonly sections: ReadonlyArray<AnySection>;
	
	constructor (init: ScriptInit) {
		this.name = init.name;
		this.enabled = init.enabled;
		this.sections = init.sections.map(init => Section.from(init, this));
	}
	
	test (url: ReadonlyURL) {
		return this.sections.some(section => section.test(url));
	}
}