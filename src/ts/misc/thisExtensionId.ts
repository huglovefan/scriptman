//
// gets the current extension id
//

import {ReadonlyURL} from "./ReadonlyURL";

export const thisExtensionId = new ReadonlyURL(chrome.runtime.getURL(".")).hostname;