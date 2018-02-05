import {AnyMatchInit} from "../../background/Match";
import {sel} from "../all";
import {SectionForm, SectionFormElement} from "./SectionForm";

export type MatchFormElement = HTMLDivElement;

export namespace MatchForm {
	
	const clone = () => {
		return <MatchFormElement>
			sel("template", "#matchTemplate", document).content.cloneNode(true).children[0];
	};
	
	export const create = (init?: AnyMatchInit) => {
		const match = clone();
		sel("button", "[name=removeMatch]", match).addEventListener("click", () => {
			const section = <SectionFormElement> match.closest(".section");
			match.remove();
			SectionForm.updateMatchCounts(section);
		});
		if (init) setValue(match, init);
		return match;
	};
	
	export const focus = (match: MatchFormElement, selectAll = false) => {
		const value = sel("input", "[name=matchValue]", match);
		value.focus();
		if (selectAll) {
			value.selectionStart = 0;
			value.selectionEnd = value.value.length;
		}
	};
	
	export const getValue = (match: MatchFormElement) => {
		const result: Partial<AnyMatchInit> = {};
		result.type = <AnyMatchInit["type"]> sel("select", "[name=matchType]", match).value;
		result.value = sel("input", "[name=matchValue]", match).value;
		return <AnyMatchInit> result;
	};
	
	export const setValue = (match: MatchFormElement, init: AnyMatchInit) => {
		sel("select", "[name=matchType]", match).value = init.type;
		sel("input", "[name=matchValue]", match).value = init.value;
	};
}