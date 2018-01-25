import {AnyMatchInit} from "../../background/Match";
import {AnySectionInit, CssSection, JsSection, Section} from "../../background/Section";
import {eventRace, select, selectAll} from "../all";
import {editor, syntaxCheckOptions} from "../editor";
import {initTextarea} from "./initTextarea";
import {MatchForm, MatchFormElement} from "./MatchForm";
import {syntaxCheck} from "./syntaxCheck";

select; // not unused

export type SectionFormElement = HTMLFieldSetElement;

export namespace SectionForm {
	
	// tslint:disable only-arrow-functions
	declare function select (selector: "template#sectionTemplate", scope: Document): HTMLTemplateElement;
	declare function select (selector: "select[name=sectionType]", scope: SectionFormElement): HTMLSelectElement;
	declare function select (selector: "select[name=sectionRunAt]", scope: SectionFormElement): HTMLSelectElement;
	declare function select (selector: "select[name=sectionContext]", scope: SectionFormElement): HTMLSelectElement;
	declare function select (selector: "select[name=sectionCssOrigin]", scope: SectionFormElement): HTMLSelectElement;
	declare function select (selector: "select[name=sectionFrameBehavior]", scope: SectionFormElement): HTMLSelectElement;
	declare function select (selector: "textarea[name=sectionBody]", scope: SectionFormElement): HTMLTextAreaElement;
	declare function select (selector: "button[name=addMatch]", scope: SectionFormElement): HTMLButtonElement;
	declare function select (selector: "button[name=removeSection]", scope: SectionFormElement): HTMLButtonElement;
	declare function select (selector: "div[name=matchArea]", scope: SectionFormElement): HTMLDivElement;
	declare function select (selector: "summary.matches", scope: SectionFormElement): HTMLElement;
	declare function select (selector: "button[name=addExclude]", scope: SectionFormElement): HTMLButtonElement;
	declare function select (selector: "div[name=excludeArea]", scope: SectionFormElement): HTMLDivElement;
	declare function select (selector: "summary.excludes", scope: SectionFormElement): HTMLElement;
	// tslint:enable only-arrow-functions
	
	const clone = () => {
		return <SectionFormElement>
			(<DocumentFragment> select("template#sectionTemplate", document).content.cloneNode(true)).children[0];
	};
	
	export const getType = (section: SectionFormElement) => {
		return select("select[name=sectionType]", section).value;
	};
	
	const updateType = (section: SectionFormElement) => {
		const currtype = getType(section);
		for (const element of selectAll("[data-section-type]", section)) {
			element.hidden = (element.dataset.sectionType !== currtype);
		}
	};
	
	export const create = (init?: AnySectionInit) => {
		const section = clone();
		select("select[name=sectionType]", section).addEventListener("change", () => {
			updateType(section);
			section.dispatchEvent(new CustomEvent("typechange"));
		});
		initTextarea(select("textarea[name=sectionBody]", section), section);
		select("button[name=addMatch]", section).addEventListener("click", () => {
			addMatch(section);
		});
		select("button[name=addExclude]", section).addEventListener("click", () => {
			addExclude(section);
		});
		select("button[name=removeSection]", section).addEventListener("click", () => {
			section.remove();
		});
		if (init) {
			setValue(section, init);
		} else {
			updateType(section);
			updateMatchCounts(section);
		}
		return section;
	};
	
	export const getValue = (section: SectionFormElement) => {
		const result: Partial<AnySectionInit> = {};
		result.type = <AnySectionInit["type"]> select("select[name=sectionType]", section).value;
		if (result.type === "js") {
			result.runAt = <JsSection.RunAt> select("select[name=sectionRunAt]", section).value;
			result.context = <JsSection.Context> select("select[name=sectionContext]", section).value;
		} else if (result.type === "css") {
			result.cssOrigin = <CssSection.CssOrigin> select("select[name=sectionCssOrigin]", section).value;
		}
		result.frameBehavior = <Section.FrameBehavior> select("select[name=sectionFrameBehavior]", section).value;
		result.body = select("textarea[name=sectionBody]", section).value;
		result.matches = Array.from(
			select("div[name=matchArea]", section).children,
			MatchForm.getValue);
		result.excludes = Array.from(
				select("div[name=excludeArea]", section).children,
				MatchForm.getValue);
		return <AnySectionInit> result;
	};
	
	export const setValue = (section: SectionFormElement, init: AnySectionInit) => {
		select("select[name=sectionType]", section).value = init.type;
		updateType(section);
		if (init.type === "js") {
			select("select[name=sectionRunAt]", section).value = init.runAt;
			select("select[name=sectionContext]", section).value = init.context;
		} else if (init.type === "css") {
			select("select[name=sectionCssOrigin]", section).value = init.cssOrigin;
		}
		select("select[name=sectionFrameBehavior]", section).value = init.frameBehavior;
		select("textarea[name=sectionBody]", section).value = init.body;
		select("div[name=matchArea]", section)
			.append(...init.matches.map((i) => MatchForm.create(i)));
		select("div[name=excludeArea]", section)
			.append(...init.excludes.map((i) => MatchForm.create(i)));
		updateMatchCounts(section);
	};
	
	export const addMatch = (section: SectionFormElement, init?: AnyMatchInit, focus = true) => {
		let selectAll = false;
		if (init === void 0 && editor!.from !== null) {
			const frommatch: AnyMatchInit = {type: "domain", value: editor!.from!};
			if (!hasMatchOrExclude(section, frommatch)) {
				// tslint:disable-next-line:no-parameter-reassignment
				init = frommatch;
				selectAll = true;
			}
		}
		const match = MatchForm.create(init);
		select("div[name=matchArea]", section).appendChild(match);
		if (focus || selectAll) MatchForm.focus(match, selectAll);
		updateMatchCounts(section);
	};
	
	const addExclude = (section: SectionFormElement, init?: AnyMatchInit) => {
		let selectAll = false;
		if (init === void 0 && editor!.from !== null) {
			const frommatch: AnyMatchInit = {type: "domain", value: editor!.from!};
			if (!hasMatchOrExclude(section, frommatch)) {
				// tslint:disable-next-line:no-parameter-reassignment
				init = frommatch;
				selectAll = true;
			}
		}
		const match = MatchForm.create(init);
		select("div[name=excludeArea]", section).appendChild(match);
		MatchForm.focus(match, selectAll);
		updateMatchCounts(section);
	};
	
	const hasMatchOrExclude = (section: SectionFormElement, search: AnyMatchInit) => {
		const elements = [
			...select("div[name=matchArea]", section).children,
			...select("div[name=excludeArea]", section).children,
		];
		return elements.some((child: MatchFormElement) => {
			const match = MatchForm.getValue(child);
			return match.type === search.type &&
				match.value.trim().toLowerCase() === search.value;
		});
	};
	
	export const updateMatchCounts = (section: SectionFormElement) => {
		select("summary.matches", section).dataset.count =
			String(selectAll("[name=matchArea] > .match", section).length);
		select("summary.excludes", section).dataset.count =
			String(selectAll("[name=excludeArea] > .match", section).length);
	};
	
	export const checkSyntax = async (section: SectionFormElement) => {
		const type = getType(section);
		if (type === "js") {
			const textarea = select("textarea[name=sectionBody]", section);
			try {
				const result = await syntaxCheck(textarea.value, syntaxCheckOptions);
				if (result !== null) {
					showSyntaxError(section, result.message, result.position);
					return false;
				}
			} catch (error) {
				console.error(error);
			}
		}
	};
	
	export const showSyntaxError = (section: SectionFormElement, message: string, position?: number) => {
		
		const textarea = select("textarea[name=sectionBody]", section);
		
		textarea.setCustomValidity(message);
		textarea.reportValidity();
		
		if (position !== void 0) {
			textarea.selectionStart = textarea.selectionEnd = position;
		}
		
		eventRace(
			[section, "typechange"],
			[textarea, "blur", "click", "input"],
			[window, "editorsave"]
		).then(() => {
			textarea.setCustomValidity("");
		});
	};
	
	export const showSyntaxOk = (section: SectionFormElement) => {
		
		const textarea = select("textarea[name=sectionBody]", section);
		
		textarea.style.outline = "2px auto rgba(32, 128, 64, 0.75)";
		
		eventRace(
			[section, "typechange"],
			[textarea, "blur", "click", "input"]
		).then(() => {
			textarea.style.outline = "";
		});
	};
}