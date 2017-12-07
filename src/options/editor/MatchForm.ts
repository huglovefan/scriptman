import {AnyMatchInit} from "../../background/Match";
import {select} from "../all";
import {SectionForm, SectionFormElement} from "./SectionForm";

select; // not unused

export type MatchFormElement = HTMLDivElement;

export namespace MatchForm {
	
	function select (selector: "template#matchTemplate", scope: Document): HTMLTemplateElement;
	function select (selector: "select[name=matchType]", scope: MatchFormElement): HTMLSelectElement;
	function select (selector: "input[name=matchValue]", scope: MatchFormElement): HTMLInputElement;
	function select (selector: "button[name=removeMatch]", scope: MatchFormElement): HTMLButtonElement;
	
	// @ts-ignore
	function clone () {
		return <MatchFormElement>
			(<DocumentFragment> select("template#matchTemplate", document).content.cloneNode(true)).children[0];
	}
	
	export function create (init?: AnyMatchInit) {
		const match = clone();
		select("button[name=removeMatch]", match).addEventListener("click", function () {
			const section = <SectionFormElement> match.closest(".section");
			match.remove();
			SectionForm.updateMatchCounts(section);
		});
		if (init) setValue(match, init);
		return match;
	}
	
	export function focus (match: MatchFormElement, selectAll = false) {
		const value = select("input[name=matchValue]", match);
		value.focus();
		if (selectAll) {
			value.selectionStart = 0;
			value.selectionEnd = value.value.length;
		}
	}
	
	export function getValue (match: MatchFormElement) {
		const result: Partial<AnyMatchInit> = {};
		result.type = <AnyMatchInit["type"]> select("select[name=matchType]", match).value;
		result.value = select("input[name=matchValue]", match).value;
		return <AnyMatchInit> result;
	}
	
	export function setValue (match: MatchFormElement, init: AnyMatchInit) {
		select("select[name=matchType]", match).value = init.type;
		select("input[name=matchValue]", match).value = init.value;
	}
}