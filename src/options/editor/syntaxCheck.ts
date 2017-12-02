import {SyntaxCheckWindow} from "./syntaxCheckFrame";

export type SyntaxCheckResult = {
	position: number,
	lineno: number,
	colno: number,
	message: string,
};

export type SyntaxCheckFunction = typeof syntaxCheck;

export type SyntaxCheckOptions = {
	strictMode?: boolean,
	wrapFunction?: "arrow" | "normal",
};

export function syntaxCheck (code: string, options?: SyntaxCheckOptions) {
	
	const iframe = document.createElement("iframe");
	iframe.srcdoc = `<script src="../js/syntaxCheckFrame.js"></script>`;
	iframe.setAttribute("style", "position: absolute; top: -9999px; left: -9999px;");
	
	return new Promise<SyntaxCheckResult | null>((resolve, reject) => {
		
		const onIframeLoad = async () => {
			const syntaxCheckFunction = (<SyntaxCheckWindow> iframe.contentWindow).syntaxCheck;
			if (syntaxCheckFunction !== void 0) {
				try {
					resolve(await syntaxCheckFunction(code, options));
				} catch (error) {
					reject(error);
				}
			} else {
				reject(new Error("Syntax check failed: syntaxCheckFrame.js didn't run"));
			}
			cleanup();
		};
		const onIframeError = (error: ErrorEvent) => {
			console.error(error);
			reject(new Error("Syntax check failed: iframe failed to load"));
			cleanup();
		};
		
		const cleanup = () => {
			iframe.removeEventListener("load", onIframeLoad);
			iframe.removeEventListener("error", onIframeError);
			iframe.remove();
		};
		
		iframe.addEventListener("load", onIframeLoad);
		iframe.addEventListener("error", onIframeError);
		
		document.documentElement.append(iframe);
	});
}