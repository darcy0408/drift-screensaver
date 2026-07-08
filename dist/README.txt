DRIFT — an ambient atlas (Windows screensaver)
===============================================

INSTALL
  1. Keep this whole folder together (the .scr needs the DLLs and web\ beside it).
  2. Right-click DriftSaver.scr  ->  Install
  3. In the Screen Saver Settings dialog that opens, set your wait time and click OK.
     (Settings > Personalization > Lock screen > Screen saver gets you back there.)

  Tip: leave "On resume, display logon screen" unchecked — otherwise Windows locks
  the PC every time you exit the screensaver.

SETTINGS
  Click "Settings..." in the Screen Saver dialog (or run DriftSaver.scr with no
  arguments) to pick a tour mode, seconds per place, and place-name labels.
  Saved to %APPDATA%\DriftSaver\settings.txt.

CONTROLS (while running)
  N / PageDown        next place
  B / PageUp          previous place
  Two-finger scroll   pan around (touchpad; any direction)
  Pinch / Ctrl+scroll zoom (mouse wheel alone also zooms)
  Arrow keys / WASD   pan around
  + / -               zoom in / out
  Mouse drag          pan (auto-pauses the tour)
  Space               pause / resume the tour
  I                   area intel (Wikipedia summary + what's nearby)
  V                   passport — your pinned places; click one to fly back
  M                   mystery files only
  R                   deep-field random mode
  G                   golden hour mode — only places near sunrise/sunset right now
  L                   place-name labels
  P                   pin place to your passport
  ESC                 exit the screensaver

  Location cards show live local weather (°C and °F) and today's daylight
  window (via Open-Meteo).

  CLICK anywhere on the map to find out what's there: a marker drops, the
  card identifies the spot, and the MORE INTEL button (or I) opens the full
  brief — Wikipedia summary, country statistics (population, capital, area,
  languages, currency), a country profile, current conditions, and what
  else is on record nearby.

  Unlike a normal screensaver, keys and mouse do NOT exit — only ESC does.

REQUIREMENTS
  Windows 11 (or Windows 10 with the Microsoft WebView2 Evergreen Runtime),
  an internet connection for map imagery.

TROUBLESHOOTING
  Create an empty file named debug.flag next to DriftSaver.scr and run it again:
  a drift-log.txt appears with the page's console output. Delete debug.flag when done.

The web app itself also runs in any browser — open web\index.html directly.
