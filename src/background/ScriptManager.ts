//
// the place for "misc stuff" meaning i'm too lazy to figure out where they should really go
//

import {BackgroundPageWindow} from "./background";
import {Script, ScriptInit} from "./Script";
import {AnySection} from "./Section";
import {Connector} from "./Connector";
import browser from "webextension-polyfill";
import Deferred from "../Deferred/Deferred";

namespace ScriptManager {
	
	export type StorageChanges = {[key: string]: chrome.storage.StorageChange};
	export type SnapshotData = {
		tabs: chrome.tabs.Tab[],
		frames: {[tabId: number]: chrome.webNavigation.GetAllFrameResultDetails[]},
	};
	
	function isMetaKey (key: string) {
		return /^__[^]*__$/.test(key);
	}
	
	async function getSnapshot () {
		
		const tabs: chrome.tabs.Tab[] = await browser.tabs.query({});
		
		const framePromises: {[tabId: number]: Promise<chrome.webNavigation.GetAllFrameResultDetails[]>} = {};
		for (const tab of tabs) {
			framePromises[tab.id!] = browser.webNavigation.getAllFrames({tabId: tab.id!});
		}
		
		const frames: {[tabId: number]: chrome.webNavigation.GetAllFrameResultDetails[]} = {};
		for (const tabId in framePromises) {
			frames[tabId] = await framePromises[tabId];
		}
		
		return {tabs, frames};
	}
	
	async function fixupAndApplyStorage (storage: {[key: string]: any}, alwaysApply = false) {
		
		const extensionVersion = chrome.runtime.getManifest().version;
		const newVersion = (storage.__version__ !== extensionVersion);
		
		if (newVersion) {
			storage.__version__ = extensionVersion;
			for (const [id, script] of Object.entries(storage)) {
				if (isMetaKey(id)) {
					continue;
				}
				for (const section of script.sections) {
					if (section.topFrameOnly === undefined) {
						section.topFrameOnly = false;
					}
					if (section.type === "css" && section.cssOrigin === undefined) {
						section.cssOrigin = "user";
					}
					if (section.frameBehavior === undefined) {
						section.frameBehavior =
							(section.topFrameOnly) ?
								"topFrameOnly" :
								"allFrames";
					}
					if (section.topFrameOnly !== undefined) {
						delete section.topFrameOnly;
					}
				}
				if (script.topFrameOnly !== undefined) {
					delete script.topFrameOnly;
				}
			}
		}
		
		if (newVersion || alwaysApply) {
			await browser.storage.local.set(storage);
		}
		
		return storage;
	}
	
	const scripts = new Map<string, Script>();
	const connectors = new Map<AnySection, Connector>();
	const loaded = new Deferred();
	
	export async function init () {
		
		if (loaded.done) return;
		
		// inject scripts to existing tabs on browser startup
		chrome.runtime.onStartup.addListener(async () => {
			const snapshotDataPromise = getSnapshot();
			await loaded;
			const snapshotData = await snapshotDataPromise;
			for (const [_section, connector] of connectors) {
				connector.startupInject(snapshotData);
			}
		});
		
		block: {
			
			let storage: {[key: string]: ScriptInit};
			try {
				storage = await browser.storage.local.get();
			} catch (error) {
				console.error(error);
				break block;
			}
			
			storage = await fixupAndApplyStorage(storage);
			
			for (const [id, init] of Object.entries(storage)) {
				if (isMetaKey(id)) {
					continue;
				}
				add(id, init);
			}
		}
		
		browser.storage.onChanged.addListener(onStorageChanged);
		
		loaded.resolve();
	}
	
	function onStorageChanged (changes: ScriptManager.StorageChanges, areaName: string) {
		
		if (areaName !== "local") {
			return;
		}
		
		for (const [key, {newValue}] of Object.entries(changes)) {
			
			if (isMetaKey(key)) {
				continue;
			}
			
			if (scripts.has(key)) {
				remove(key);
			}
			
			if (newValue !== undefined) {
				add(key, newValue);
			}
		}
	}
	
	async function uninject (snapshot: Promise<ScriptManager.SnapshotData>, section: AnySection) {
		const data = await snapshot;
		for (const tab of data.tabs) {
			for (const frame of data.frames[tab.id!]) {
				section.injection.remove(tab.id!, frame.frameId);
			}
		}
	}
	
	function remove (id: string) {
		
		const script = scripts.get(id);
		if (script === undefined) {
			return;
		}
		
		const snapshot = getSnapshot();
		
		for (const section of script.sections) {
			
			const connector = connectors.get(section);
			if (connector === undefined) {
				continue;
			}
			
			connector.disconnect();
			connectors.delete(section);
			uninject(snapshot, section);
		}
		
		scripts.delete(id);
	}
	
	function add (id: string, init: ScriptInit) {
		
		if (scripts.has(id)) {
			remove(id);
		}
		
		let script;
		try {
			 script = new Script(init);
		} catch (error) {
			console.error(error);
			return;
		}
		
		if (script.enabled) {
			
			for (const section of script.sections) {
				
				let connector;
				try {
					connector = Connector.for(section);
				}  catch (error) {
					console.error(error);
					continue;
				}
				
				connectors.set(section, connector);
			}
		}
		
		scripts.set(id, script);
	}
	
	// public api
	
	export async function getAll () {
		await loaded;
		return scripts.entries();
	}
	
	export async function get (id: string) {
		await loaded;
		return scripts.get(id);
	}
	
	export async function getRaw (id: string) {
		return <ScriptInit | undefined> (await browser.storage.local.get(id))[id];
	}
	
	export async function importStorage (storage: {[key: string]: any}) {
		await loaded;
		await fixupAndApplyStorage(storage, true);
	}
}

type ScriptManager = typeof ScriptManager;

export default ScriptManager;

(<BackgroundPageWindow> window).ScriptManager = ScriptManager;