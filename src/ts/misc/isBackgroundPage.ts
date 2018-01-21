//
// checks if a window is the background page
//

import {BackgroundPageWindow} from "../background/background";

type AnyWindow = Window | BackgroundPageWindow;

// todo: "_generated_background_page" might be chrome-only
//       - need to move the background page to a proper html page
//       - name it something that can be checked for here

export default function isBackgroundPage (w: AnyWindow = window): w is BackgroundPageWindow {
	return (
		w.location.pathname === "/_generated_background_page.html"
	);
}