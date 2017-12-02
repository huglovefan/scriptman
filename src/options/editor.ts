import {SyntaxCheckOptions} from "./editor/syntaxCheck";
import Editor from "./editor/Editor";

export const syntaxCheckOptions: SyntaxCheckOptions = {
	strictMode: true,
	wrapFunction: "arrow",
};

export const editor = Editor.init();