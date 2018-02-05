import {sel} from "../all";
import {syntaxCheckOptions} from "../editor";
import {SectionForm, SectionFormElement} from "./SectionForm";
import {syntaxCheck} from "./syntaxCheck";

export const initTextarea = (textarea: HTMLTextAreaElement, section: SectionFormElement) => {
	textarea.addEventListener("keydown", (event) => {
		if (event.key === "c" && event.altKey && !event.ctrlKey && SectionForm.getType(section) === "js") {
			syntaxCheck(textarea.value, syntaxCheckOptions)
				.then((result) => {
					if (result === null) {
						SectionForm.showSyntaxOk(section);
					} else {
						SectionForm.showSyntaxError(section, result.message, result.position);
					}
				})
				.catch((error) => {
					console.error(error);
					alert("syntax check failed:\n\n" + error);
				});
		}
		if (event.key === "s" && !event.altKey && event.ctrlKey) {
			sel("button", "[name=saveScript]", document).click();
			event.preventDefault();
		}
	});
};