# inject css on add

using removeCSS when available is implemented now, but it'd be more consistent if css was added as well as removed when editing it

- Section.injectStatic(snapshot)
- could probably move commonStartupInject to section as well
- where to call?
- will it interfere with startup inject?