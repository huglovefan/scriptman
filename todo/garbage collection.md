- investigate high memory usage

- when a script is deleted, remove from tab manager
-- have a scriptdelete event
--- removing the script object from the set would always decrement the counter when scripts can't always be un-injected
---- should do something other than storing script objects, and only decrement counter when it was really un-injected