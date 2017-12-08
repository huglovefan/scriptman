# implement match groups

to solve duplication of matches, a script should define names groups of matches that sections can then use by name (good for usability too)

interface MatchGroup {
	name: string;
	matches: Match[];
}
interface Script {
	matchGroups: MatchGroup[];
}
interface Secton {
	// thes are indices in the script's matchGroups array
	matches: number[];
	excludes: number[];
}