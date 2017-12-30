import ReadonlyURL from "../ReadonlyURL/ReadonlyURL";

export default new ReadonlyURL(chrome.runtime.getURL(".")).hostname;