import browser from "webextension-polyfill";
import {ZalgoPromise} from "zalgo-promise";
import {isMetaKey} from "./misc/isMetaKey";

export const fixupAndApplyStorage = (storage: {[key: string]: any}, alwaysApply = false) => {
	
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
		return (<Promise<any>> browser.storage.local.set(storage)).then(() => storage);
	}
	
	return ZalgoPromise.resolve(storage);
};