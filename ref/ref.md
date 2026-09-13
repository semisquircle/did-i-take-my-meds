<!-- ? release checklist -->
[x] increase version number in package.json
[x] increase version number in app.config.ts

[x] run py -3.13 generate-app-icons.py
[x] run npx expo install --fix
[x] run npx expo-doctor
[x] run npx expo config
[x] run npm run lint
[x] run npx tsc --noEmit
[x] run npx eslint .

[x] comment development lines in global.ts
[x] comment development lines in _layout.tsx

[x] confirm location prompt displays on fresh install
[x] confirm pressing location continue button triggers location alert, proceeds to notification prompt
[x] confirm notification prompt displays on fresh install
[x] confirm pressing notification continue button triggers notification alert, proceeds to main
[x] confirm main loader displays if necessary

[x] confirm you are here message only displays when dynamic location is toggled
[x] confirm pluto is draggable
[x] confirm body time uses tall, short, and wide fonts when applicable
[x] confirm finger shows every 30 seconds

[x] confirm update button links to app store page
[x] confirm notif freqs toggle between 0, 30, 60 notifications + writes save
[x] confirm time format toggles between 12 and 24-hour time on index + and writes save

[x] confirm location toggle
    - hides/unhides city input
    - pauses/unpauses terra
    - geolocates on dynamic
    - hides/unhides location arrow
    - writes save
[x] confirm city input animates on tap, shows city results, hides map + terra
[x] confirm cancel button hides keyboard, blurs city input, and unhides map + terra
[x] confirm searching a city string finds <=15 matching city results
[x] confirm city results scrolls based on keyboard height (okay if result dims on drag)
[x] confirm tapping on a city result
    - updates map pin
    - updates map tiles
    - recalculates pluto time
    - displays city name on index

[x] all features tested on ios
[x] all features tested on android


<!-- ? what's new -->
- app.json -> app.config.ts
- added platform ignore prebuild script
- added helpers.js
- started tracking default save data
- android notification icon is now XML (withNotificationIcons)
- expo-notifications -> notifee (react-native-notify-kit)
- fixed notification title + body wording based on dynamic/static location
- converted/upgraded hades (4 weights) to tombaugh (6 weights)
- converted reanimated shared value assigns to setters
- canceled reanimated animations with proper cancelAnimation calls
- converted function declarations to const arrow functions
- implemented layout loader
- converted cities.json to cities.db (expo-sqlite)
- reformatted city scroll view to fix broken scrolling on android
- updated app store screenshots


<!-- ! bugs -->
- notifee forces notification banner when app is in foreground on android, even when onForegroundEvent runs cancelNotification
- tabs can sometimes incorrectly toggle their PNG backgrounds, but maintain the SVG icon styling
- layout loader is not pixel perfect
- city result ellipses get cut off on the right on android
