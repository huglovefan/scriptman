import {AnyMatchInit} from "../../background/Match";
import {select} from "../all";
import {SectionForm, SectionFormElement} from "./SectionForm";

select; // not unused

export type MatchFormElement = HTMLDivElement;

export namespace MatchForm {
	
	/* tslint:disable only-arrow-functions */
	declare function select (selector: "template#matchTemplate", scope: Document): HTMLTemplateElement;
	declare function select (selector: "select[name=matchType]", scope: MatchFormElement): HTMLSelectElement;
	declare function select (selector: "input[name=matchValue]", scope: MatchFormElement): HTMLInputElement;
	declare function select (selector: "button[name=removeMatch]", scope: MatchFormElement): HTMLButtonElement;
	/* tslint:enable only-arrow-functions */
	
	const clone = () => {
		return <MatchFormElement>
			(<DocumentFragment> select("template#matchTemplate", document).content.cloneNode(true)).children[0];
	};
	
	export const create = (init?: AnyMatchInit) => {
		const match = clone();
		select("button[name=removeMatch]", match).addEventListener("click", () => {
			const section = <SectionFormElement> match.closest(".section");
			match.remove();
			SectionForm.updateMatchCounts(section);
		});
		if (init) setValue(match, init);
		return match;
	};
	
	export const focus = (match: MatchFormElement, selectAll = false) => {
		const value = select("input[name=matchValue]", match);
		value.focus();
		if (selectAll) {
			value.selectionStart = 0;
			value.selectionEnd = value.value.length;
		}
	};
	
	export const getValue = (match: MatchFormElement) => {
		const result: Partial<AnyMatchInit> = {};
		result.type = <AnyMatchInit["type"]> select("select[name=matchType]", match).value;
		result.value = select("input[name=matchValue]", match).value;
		return <AnyMatchInit> result;
	};
	
	export const setValue = (match: MatchFormElement, init: AnyMatchInit) => {
		select("select[name=matchType]", match).value = init.type;
		select("input[name=matchValue]", match).value = init.value;
	};
}