import {SectionFormElement, SectionForm} from "./SectionForm";
import {syntaxCheck} from "./syntaxCheck";
import {select} from "../all";
import {syntaxCheckOptions} from "../editormain";

select; // not unused

export default function initTextarea (textarea: HTMLTextAreaElement, section: SectionFormElement) {
	// @ts-ignore
	function select (selector: "button[name=saveScript]", scope: Document): HTMLButtonElement;
	textarea.addEventListener("keydown", event => {
		if (event.key === "c" && event.altKey && !event.ctrlKey && SectionForm.getType(section) === "js") {
			syntaxCheck(textarea.value, syntaxCheckOptions)
				.then(result => {
					if (result === null) {
						SectionForm.showSyntaxOk(section);
					} else {
						SectionForm.showSyntaxError(section, result.message, result.position);
					}
				})
				.catch(error => {
					console.error(error);
					alert("syntax check failed:\n\n" + error);
				});
		}
		if (event.key === "s" && !event.altKey && event.ctrlKey) {
			select("button[name=saveScript]", document).click();
			event.preventDefault();
		}
	});
}