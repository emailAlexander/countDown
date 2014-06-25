countDown
=========

QUICK START:
Since version 3 there is a new input system:
* Mouse:
   Scroll up/down over the time to adjust.
* Keyboard:
   Enter the number directly (there is no input field), click on timer (you will notice a white triangle on left top corner).
   The "." or "," acts as separators between hours, minutes or seconds.
   For example:
      5 hours 7 minutes and 35 seconds => 5.7.35 or 50735
      23 days 5 hours 25 minutes => 23.5.25. or 23052500
      45 minutes => 45. or 4500
      15 seconds => 15

FEATURES:
 * Set as many timers as you need
 * Count up to 999 days.
 * Set countup (like stopwatch without miliseconds) to start set timer to 00:00:00
 * Countdown is still counting when browser is closed
 * Pause/Resume/Reset the timer
 * Display timer in icon badge [red for (hour:min) / green for (min:sec)]
 * Sound Notification with CountDown state and CountUp shown
 * Set and navigate the timers with keyboard
 * Set timer with scroll wheel
 * Set custom message for each countdown

TODO:
 * [Update images, create a User Guide and maybe a short Tutorial]
 * Options page
    * Autoselect the default to next LTR timer.
    * Export to csv
    * Internationalization
 * [Your suggestion here]

P.S.: Rate the extension and spread the word to encourage the developer (me) to dedicate more time in implementing more features.

P.P.S : Make your suggestions, if there is something that you miss or dislike, please make me know.
---------------------
UPDATE LOG:
 * v 3.0.5 : Added rich notification api
 * v 3.0.1 : Added restart and dismiss in notification popup
 * v 3.0 : Refactored completely (new cool features will be available soon)
 * v 2.9.2.1 : UI fix
 * v 2.9.2 : Updated limit up to 22 timers, run in background, other bugfixes
 * v 2.9.1.8 : Changed note input.
 * v 2.9.1.7 : Bug fixes, canvas icons replaced by svg.
 * v 2.9.0.7 : Overdue fixed
 * v 2.9.0.5 : Badge fixed
 * v 2.9 : New features: countup, set on time alarm. Improved input. Optimized
 * v 2.8.7.3 : Bugfix
 * v 2.8.5 : Set timer with scroll wheel, other bug fixes
 * v 2.8.1.1 : Overlap fix, font fix.
 * v 2.8.0 : Included jquery library. Manual sort, redesigned notes view.
 * v 2.7.1 : Bugfix for data corruption. [error: 0323] will alert after update to 2.7.1
 * v 2.7.0.1 : Minor bugfix
 * v 2.7.0 : New canvas driven UI with more animations, ability to delete the timer in any position
 * v 2.1.0 : Implemented navigation key setup + minor bugfuxes
 * v 2.0.1 : Fixed a bug related with deleting the default timer
 * v 2.0 : MultiTimer implementation with dynamic management + few bugfixes
 * v 1.7 : Implemented custom notes and snooze
 * v 1.5 : Optimized interface for timer input; offline timer (runs even when browser is closed, [notification will show only if browser is open])
 * v 1.2 : Implemented a pause function
 * v 1.1.5 : Corrected a tiny bug(?) about focus after running the timer
