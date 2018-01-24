import {Editor} from "./editor/Editor";
import {SyntaxCheckOptions} from "./editor/syntaxCheck";

export const syntaxCheckOptions: SyntaxCheckOptions = {
	strictMode: true,
	wrapFunction: "arrow",
};

export const editor = Editor.init();