import {FRAME_ID_TOP} from "../misc/FRAME_ID_TOP";
import {returnTrue} from "../misc/functionConstants";
import {Injection} from "./Injection";
import {MatchList} from "./MatchList";
import {NavigationDetails, onNavigated} from "./onNavigated";
import {Section} from "./Section";

const frameBehaviorTests: {
	[key in Section.FrameBehavior]: (details: NavigationDetails) => boolean
} = {
	allFrames: returnTrue,
	subFramesOnly: ({frameId}: NavigationDetails) => frameId !== FRAME_ID_TOP,
	topFrameOnly: ({frameId}: NavigationDetails) => frameId === FRAME_ID_TOP,
};

interface ConnectorInit {
	matches: MatchList;
	excludes: MatchList;
	frameBehavior: Section.FrameBehavior;
	injection: Injection;
}

export class Connector {
	private readonly event: typeof onNavigated;
	private readonly injection: Injection;
	public constructor (init: ConnectorInit) {
		this.event = onNavigated.filter([
			frameBehaviorTests[init.frameBehavior] || returnTrue,
			init.matches.getNavigationFilter(),
			init.excludes.getNavigationFilter(),
		]);
		this.injection = init.injection;
		this.navigationCallback = this.navigationCallback.bind(this);
		this.event.addListener(this.navigationCallback);
	}
	private navigationCallback ({tabId, frameId}: NavigationDetails) {
		this.injection.inject(tabId, frameId);
	}
	public disconnect () {
		this.event.removeListener(this.navigationCallback);
	}
}