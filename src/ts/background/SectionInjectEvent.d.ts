import {AnySection} from "./Section";

type SectionInjectEvent = CustomEvent<{
	section: AnySection;
	tabId: number;
	frameId: number;
}>;

declare global {
	interface WindowEventMap {
		sectioninjected: SectionInjectEvent;
		sectioninjectionremoved: SectionInjectEvent;
	}
}