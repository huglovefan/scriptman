interface ParentNode {
	append (...nodes: (Node | string)[]): void;
	prepend (...nodes: (Node | string)[]): void;
}

interface HTMLDetailsElement extends HTMLElement {
	open: boolean;
}

interface HTMLInputElement {
	reportValidity (): void;
}
interface HTMLTextAreaElement {
	reportValidity (): void;
}

interface HTMLIFrameElement {
	srcdoc: string;
}