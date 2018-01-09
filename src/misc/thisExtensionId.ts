//
// gets the current extension id
//

import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";

export default new ReadonlyURL(chrome.runtime.getURL(".")).hostname;