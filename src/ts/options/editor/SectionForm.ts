import {AnyMatchInit} from "../../background/Match";
import {AnySectionInit, CssSection, JsSection, Section} from "../../background/Section";
import {eventRace, sel, selAll} from "../all";
import {editor, syntaxCheckOptions} from "../editor";
import {initTextarea} from "./initTextarea";
import {MatchForm, MatchFormElement} from "./MatchForm";
import {syntaxCheck} from "./syntaxCheck";

export type SectionFormElement = HTMLFieldSetElement;

export namespace SectionForm {
	
	const clone = () => {
		return <SectionFormElement>
			sel("template", "#sectionTemplate", document).content.cloneNode(true).children[0];
	};
	
	export const getType = (section: SectionFormElement) => {
		return sel("select", "[name=sectionType]", section).value;
	};
	
	const updateType = (section: SectionFormElement) => {
		const currtype = getType(section);
		for (const element of selAll("*", "[data-section-type]", section)) {
			element.hidden = (element.dataset.sectionType !== currtype);
		}
	};
	
	export const create = (init?: AnySectionInit) => {
		const section = clone();
		sel("select", "[name=sectionType]", section).addEventListener("change", () => {
			updateType(section);
			section.dispatchEvent(new CustomEvent<null>("typechange"));
		});
		initTextarea(sel("textarea", "[name=sectionBody]", section), section);
		sel("button", "[name=addMatch]", section).addEventListener("click", () => {
			addMatch(section);
		});
		sel("button", "[name=addExclude]", section).addEventListener("click", () => {
			addExclude(section);
		});
		sel("button", "[name=removeSection]", section).addEventListener("click", () => {
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
		result.type = <AnySectionInit["type"]> sel("select", "[name=sectionType]", section).value;
		if (result.type === "js") {
			result.runAt = <JsSection.RunAt> sel("select", "[name=sectionRunAt]", section).value;
			result.context = <JsSection.Context> sel("select", "[name=sectionContext]", section).value;
		} else if (result.type === "css") {
			result.cssOrigin = <CssSection.CssOrigin> sel("select", "[name=sectionCssOrigin]", section).value;
		}
		result.frameBehavior = <Section.FrameBehavior> sel("select", "[name=sectionFrameBehavior]", section).value;
		result.body = sel("textarea", "[name=sectionBody]", section).value;
		result.matches = Array.from(
			sel("div", "[name=matchArea]", section).children,
			MatchForm.getValue);
		result.excludes = Array.from(
				sel("div", "[name=excludeArea]", section).children,
				MatchForm.getValue);
		return <AnySectionInit> result;
	};
	
	export const setValue = (section: SectionFormElement, init: AnySectionInit) => {
		sel("select", "[name=sectionType]", section).value = init.type;
		updateType(section);
		if (init.type === "js") {
			sel("select", "[name=sectionRunAt]", section).value = init.runAt;
			sel("select", "[name=sectionContext]", section).value = init.context;
		} else if (init.type === "css") {
			sel("select", "[name=sectionCssOrigin]", section).value = init.cssOrigin;
		}
		sel("select", "[name=sectionFrameBehavior]", section).value = init.frameBehavior;
		sel("textarea", "[name=sectionBody]", section).value = init.body;
		sel("div", "[name=matchArea]", section)
			.append(...init.matches.map((i) => MatchForm.create(i)));
		sel("div", "[name=excludeArea]", section)
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
		sel("div", "[name=matchArea]", section).appendChild(match);
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
		sel("div", "[name=excludeArea]", section).appendChild(match);
		MatchForm.focus(match, selectAll);
		updateMatchCounts(section);
	};
	
	const hasMatchOrExclude = (section: SectionFormElement, search: AnyMatchInit) => {
		const elements = [
			...sel("div", "[name=matchArea]", section).children,
			...sel("div", "[name=excludeArea]", section).children,
		];
		return elements.some((child: MatchFormElement) => {
			const match = MatchForm.getValue(child);
			return match.type === search.type &&
				match.value.trim().toLowerCase() === search.value;
		});
	};
	
	export const updateMatchCounts = (section: SectionFormElement) => {
		sel("summary", ".matches", section).dataset.count =
			String(selAll("*", "[name=matchArea] > .match", section).length);
		sel("summary", ".excludes", section).dataset.count =
			String(selAll("*", "[name=excludeArea] > .match", section).length);
	};
	
	export const checkSyntax = async (section: SectionFormElement) => {
		const type = getType(section);
		if (type === "js") {
			const textarea = sel("textarea", "[name=sectionBody]", section);
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
		
		const textarea = sel("textarea", "[name=sectionBody]", section);
		
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
		
		const textarea = sel("textarea", "[name=sectionBody]", section);
		
		textarea.style.outline = "2px auto rgba(32, 128, 64, 0.75)";
		
		eventRace(
			[section, "typechange"],
			[textarea, "blur", "click", "input"]
		).then(() => {
			textarea.style.outline = "";
		});
	};
}