import {isBackgroundPage} from "../misc/isBackgroundPage";
import {ReadonlyURL} from "../misc/ReadonlyURL";
import {AnySection, AnySectionInit, Section} from "./Section";

console.assert(isBackgroundPage());

export interface ScriptInit {
	name: string;
	enabled: boolean;
	sections: ReadonlyArray<AnySectionInit>;
}

export class Script {
	
	public readonly name: string;
	public readonly enabled: boolean;
	public readonly sections: ReadonlyArray<AnySection>;
	
	public constructor (init: ScriptInit) {
		this.name = init.name;
		this.enabled = init.enabled;
		this.sections = init.sections.map((init) => Section.from(init, this));
	}
	
	public test (url: ReadonlyURL) {
		return this.sections.some((section) => section.test(url));
	}
	
	public disconnect () {
		if (!this.enabled) {
			return;
		}
		for (const section of this.sections) {
			section.disconnect();
		}
	}
}