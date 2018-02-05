import browser from "webextension-polyfill";
import {ScriptInit} from "../../background/Script";
import {AnySectionInit} from "../../background/Section";
import {isPlainObject} from "../../misc/isPlainObject";
import {documentLoaded, sel, selAll} from "../all";
import {SectionForm} from "./SectionForm";

const setTitle = (s: string) => {
	document.title = s + " - scriptman";
};

export abstract class Editor {
	
	public static init () {
		const params = new URLSearchParams(location.search);
		const mode = params.get("mode");
		const id = params.get("id");
		const from = params.get("from");
		if (mode === "new") {
			return new EditorNew(mode, from);
		} else if (mode === "edit" && id) {
			return new EditorEdit(mode, id, from);
		} else {
			location.assign("?mode=new");
			return null;
		}
	}
	
	public readonly mode: string;
	public readonly id: string;
	public readonly from: string | null;
	
	protected lastSavedValue: ScriptInit | null;
	
	public constructor (mode: string, id: string, from: string | null) {
		this.mode = mode;
		this.id = id;
		this.from = from;
		this.lastSavedValue = null;
		this.init();
	}
	
	private async init () {
		await this.initStart();
		await documentLoaded();
		await this.initEnd();
	}
	
	// tslint:disable-next-line:prefer-function-over-method
	protected initStart () {
	}
	
	protected initEnd () {
		sel("button", "[name=addSection]", document).addEventListener("click", () => {
			this.addSection();
		});
		sel("button", "[name=saveScript]", document).addEventListener("click", (event) => {
			this.saveButtonPressed(event);
		});
		window.addEventListener("beforeunload", (event) => {
			
			if (this.lastSavedValue === null) {
				return;
			}
			
			const currentValue = this.getValue();
			
			if (JSON.stringify(currentValue) !== JSON.stringify(this.lastSavedValue)) {
				event.returnValue = ".";
			}
		});
	}
	
	protected async saveButtonPressed (event: MouseEvent) {
		const script = this.getValue();
		if (script.name.trim() === "") {
			alert("Please enter a name.");
			sel("input", "[name=scriptName]", document).focus();
			return null;
		}
		if (!event.altKey) {
			const sections = selAll("fieldset", ".section", document);
			for (const section of sections) {
				const result = await SectionForm.checkSyntax(section);
				if (result === false) {
					return null;
				}
			}
		}
		await browser.storage.local.set({
			[this.id]: script
		});
		this.lastSavedValue = script;
		window.dispatchEvent(new CustomEvent<null>("editorsave"));
		return script;
	}
	
	// tslint:disable-next-line:prefer-function-over-method
	public getValue () {
		const result: Partial<ScriptInit> = {};
		result.name = sel("input", "[name=scriptName]", document).value;
		result.enabled = sel("input", "[name=scriptEnabled]", document).checked;
		result.sections = Array.from(
			sel("div", "[name=sectionArea]", document).children,
			SectionForm.getValue
		);
		return <ScriptInit> result;
	}
	
	// tslint:disable-next-line:prefer-function-over-method
	protected addSection (init?: AnySectionInit) {
		const section = SectionForm.create(init);
		sel("div", "[name=sectionArea]", document).appendChild(section);
	}
}

class EditorNew extends Editor {
	
	public constructor (mode: "new", from: string | null) {
		const base36 = 36;
		super(mode, Date.now().toString(base36), from);
		setTitle("new script");
	}
	
	protected async initEnd () {
		await super.initEnd();
		sel("button", "[name=deleteScript]", document).hidden = true;
		this.addSection();
		if (this.from !== null) {
			SectionForm.addMatch(sel("fieldset", ".section", document), {
				type: "domain", value: this.from
			}, false);
			sel("details", ".matchesRow", document).open = true;
		}
		this.lastSavedValue = this.getValue();
	}
	
	protected async saveButtonPressed (event: MouseEvent) {
		const script = await super.saveButtonPressed(event);
		if (script !== null) {
			location.replace("?mode=edit&id=" + encodeURIComponent(this.id));
		}
		return script;
	}
}

class EditorEdit extends Editor {
	
	public scriptName: string;
	private scriptPromise: PromiseLike<ScriptInit | undefined>;
	
	public constructor (mode: "edit", id: string, from: string | null) {
		super(mode, id, from);
		this.scriptName = ""; // "no initializer & not definitely assigned in constructor"
		this.updateName(`script #${id}`);
		this.scriptPromise = browser.storage.local.get(id).then((items: any) => items[id]);
	}
	
	private updateName (name: string) {
		this.scriptName = name;
		setTitle("editing " + name);
	}
	
	protected async initStart () {
		await super.initStart();
	}
	protected async initEnd () {
		await super.initEnd();
		sel("button", "[name=deleteScript]", document).addEventListener("click", () => {
			this.deleteButtonPressed();
		});
		await this.loadScript();
	}
	
	protected async saveButtonPressed (event: MouseEvent) {
		const script = await super.saveButtonPressed(event);
		if (script !== null) {
			this.updateName(script.name);
		}
		return script;
	}
	
	protected async deleteButtonPressed () {
		if (!confirm(`Are you sure you want to delete "${this.scriptName}"?`)) {
			return;
		}
		await browser.storage.local.remove(this.id);
		this.lastSavedValue = null;
		location.assign("scripts.html");
	}
	
	private async loadScript () {
		const script = await this.scriptPromise;
		if (!script || !isPlainObject(script)) {
			alert("The script doesn't exist.");
			location.assign("?mode=new");
			return;
		}
		this.updateName(script.name);
		sel("input", "[name=scriptName]", document).value = script.name;
		sel("input", "[name=scriptEnabled]", document).checked = script.enabled;
		for (const section of script.sections) {
			this.addSection(section);
		}
		this.lastSavedValue = this.getValue();
	}
}