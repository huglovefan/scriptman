# use tabs.executeScript for command line api

this solves two problems:

1. the content script doesn't always run before executeScript
2. the content script is injected even when no script runs on the page

plan #1:

- keep track of tabs
- a tab object has a map of frame ids where CLA has been injected
- there's no "onFrameDestroyed" event, so periodically check with the "getAllFrames" api which ids can be purged

- TabManager.getTab - creates on get?
- Tab.inject(injection) - injects CLA if needed
- TabManager destroys tabs when closed
- could make BadgeManager piggyback on TM

- injection stuff would depend on tabs now