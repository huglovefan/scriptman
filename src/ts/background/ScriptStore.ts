import browser from "webextension-polyfill";
import {Event} from "../misc/Event";
import {isMetaKey} from "./misc/isMetaKey";
import {Script, ScriptInit} from "./Script";

type StorageChange = chrome.storage.StorageChange;
type StorageChanges = {[key: string]: StorageChange};

export type ScriptStoreEvent = Event<ScriptStoreEventDetail>;
export type ScriptStoreEventDetail = Readonly<{id: string, script: Script}>;

export class ScriptStore {
	public readonly onScriptAdded: ScriptStoreEvent;
	public readonly onScriptRemoved: ScriptStoreEvent;
	private readonly scripts: Map<string, Script>;
	public readonly ready: boolean;
	public constructor () {
		this.onStorageChanged = this.onStorageChanged.bind(this);
		this.onScriptAdded = new Event();
		this.onScriptRemoved = new Event();
		this.scripts = new Map();
		this.ready = false;
	}
	public async init () {
		if (this.ready) {
			console.warn("ScriptStore.init called twice");
			return this;
		}
		loadScripts: {
			let storage;
			try {
				storage = await browser.storage.local.get();
			} catch (error) {
				console.error(error);
				break loadScripts;
			}
			for (const [key, string] of Object.entries(storage)) {
				if (isMetaKey(key)) {
					continue;
				}
				this.addScript(key, <ScriptInit> string);
			}
		}
		chrome.storage.onChanged.addListener(this.onStorageChanged);
		(<any> this).ready = true;
		return this;
	}
	public getScript (id: string) {
		return this.scripts.get(id);
	}
	public getAllScripts () {
		return [...this.scripts.entries()];
	}
	private addScript (id: string, init: ScriptInit) {
		let script;
		try {
			script = new Script(init);
		} catch (error) {
			console.error(error);
			return;
		}
		this.scripts.set(id, script);
		this.onScriptAdded.dispatch({id, script});
	}
	private removeScript (id: string) {
		const script = this.scripts.get(id);
		if (script === undefined) {
			return;
		}
		script.disconnect();
		this.onScriptRemoved.dispatch({id, script});
	}
	private onStorageChanged (changes: StorageChanges, areaName: string) {
		if (areaName !== "local") {
			return;
		}
		for (const [key, {oldValue, newValue}] of Object.entries(changes)) {
			if (isMetaKey(key)) {
				continue;
			}
			if (oldValue !== undefined) {
				this.removeScript(key);
			}
			if (newValue !== undefined) {
				this.addScript(key, newValue);
			}
		}
	}
}