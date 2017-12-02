import {SyntaxCheckFunction, SyntaxCheckResult, SyntaxCheckOptions} from "./syntaxCheck";

export interface SyntaxCheckWindow extends Window {
	syntaxCheck?: SyntaxCheckFunction;
}

{

function linenoColno2Index (s: string, lineno: number, colno: number) {
	const lineLengths: number[] = [];
	s.replace(/([^\n\r\u2028\u2029]*)(\n|\r\n?|\u2028|\u2029)|([^\n\r\u2028\u2029]+)$/g,
		((_$0: string, line?: string, end?: string, lastline?: string) => {
			lineLengths.push((lastline === void 0) ? line!.length + end!.length : lastline.length);
			return "";
		}));
	let result = 0;
	for (let i = 0; i < lineLengths.length; i++) {
		if (i >= lineno) {
			result += colno;
			break;
		}
		result += lineLengths[i];
	}
	return result;
}

// todo: possibly undefined
let offsets: {lineno: number, colno: number};

// todo: maybe detecting strict mode is possible after all? i know more about parsing now

(<SyntaxCheckWindow> window).syntaxCheck =
async function syntaxCheck (code: string, options: SyntaxCheckOptions = {}) {
	
	if (offsets === void 0) {
		offsets = {lineno: 0, colno: 0};
		const result = await syntaxCheck("^");
		if (result !== null) {
			offsets.lineno = result.lineno;
			offsets.colno = result.colno;
		} else {
			console.warn("syntaxCheck: failed to get offsets");
		}
	}
	
	const originalCode = code;
	
	let addedLines = 0;
	
	code = `throw "ok";\n` + code;
	addedLines++;
	
	if (options.strictMode) {
		code =
			`"use strict";\n` +
			code;
		addedLines++;
	}
	
	if (options.wrapFunction === "arrow") {
		code =
			`(()=>{\n` +
			code + `\n` +
			`})();`;
		addedLines++;
	} else if (options.wrapFunction === "normal") {
		code =
			`(function(){\n` +
			code + `\n` +
			`}());`;
		addedLines++;
	}
	
	const blob = new Blob([code], {type: "application/javascript"});
	const url = URL.createObjectURL(blob);
	
	const script = document.createElement("script");
	script.src = url;
	
	return new Promise<SyntaxCheckResult | null>((resolve, reject) => {
		
		const onWindowError = (event: ErrorEvent) => {
			if (
				event.error instanceof Error &&
				typeof event.lineno === "number" &&
				typeof event.colno === "number"
			) {
				const lineno = event.lineno - addedLines - offsets.lineno;
				const colno = event.colno - offsets.colno;
				const position = linenoColno2Index(originalCode, lineno, colno);
				resolve({
					position,
					lineno,
					colno,
					message: String(event.error),
				});
			} else if (event.error === "ok") {
				resolve(null);
			} else {
				reject(new Error(`Syntax check failed (unknown error): ${event.error || event.message}`));
			}
			event.preventDefault();
			cleanup();
		};
		const onScriptError = () => {
			reject(new Error(`Syntax check failed: test script failed to load`));
			cleanup();
		};
		
		const cleanup = () => {
			window.removeEventListener("error", onWindowError);
			script.removeEventListener("error", onScriptError);
			script.remove();
		};
		
		window.addEventListener("error", onWindowError);
		script.addEventListener("error", onScriptError);
		
		document.documentElement.append(script);
	});
};

}