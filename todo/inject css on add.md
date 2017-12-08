# inject css on add

using removeCSS when available is implemented now, but it'd be more consistent if css was added as well as removed when editing it

- Section.injectStatic(snapshot)
- could probably move commonStartupInject to section as well, maybe combine with this?
- where to call it?
-- in scriptmanager i guess, but which function
- will it interfere with startup inject?
-- should not do it on startup

- in the current implementation, removing css doesn't update the badge
- i think interfacing with BadgeManager should be done in Injection only
- ^ maybe with a flag to disable if the builtins also use it

- idea: store injected sections only
- count unique scripts for the badge
- remove from the list only when un-injected?

- idea: have classes for tabs and frames
- injection should go through these
- could keep track of utils also

- i think staticInject will also have to know if removing css is supported,
- ^^ or else it'll inject it again and again when updating the script
-- keep track of which tabs have which sections, and only staticInject if
-- the section or an old version of it isn't injected in it?
-2: only staticInject if the old version was removed cleanly (all sections return true on remove)
--- keep a wasRemovedCleanly flag on scripts in ScriptManager
-3: injection foes through tabs, and the tab can do nothing if a version of the same section is injected