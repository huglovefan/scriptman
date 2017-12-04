import {AnySection} from "./Section";

interface SectionInjectEventDetail {
	section: AnySection;
	tabId: number;
	frameId: number;
}

export type SectionInjectEvent = CustomEvent<SectionInjectEventDetail>;