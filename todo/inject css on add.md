# inject css on add

using removeCSS when available is implemented now, but it'd be more consistent if css was added as well as removed when editing it

- Section.injectStatic(snapshot)
- could probably move commonStartupInject to section as well
- where to call?
- will it interfere with startup inject?

- removing css doesn't update the badge
- i think interfacing with BadgeManager should be done in Injection only
- ^ maybe with a flag to disable if the builtins also use it

- actually, staticInject will also have to know if removing css is supported,
- ^^ or it'll inject it again and again
-- keep track of which tabs have which sections, and only staticInject if
-- the section or an old version of it isn't injected in it?
-2: only staticInject if the old version was removed cleanly (all sections return true on remove)
--- keep a wasRemovedCleanly flag on scripts in ScriptManager