# Galactic Operations Console Foundry Install

This folder is now a Foundry VTT module package.

1. Close Foundry.
2. Copy this whole folder into:

   ```text
   %LOCALAPPDATA%\FoundryVTT\Data\modules\
   ```

3. Rename the copied folder to:

   ```text
   star-log-imperial
   ```

4. Start Foundry, open your world, and enable **Galactic Operations Console** in **Manage Modules**.
5. Open it from the scene controls button, press `Ctrl+L`, or run this macro:

   ```js
   GalacticOperationsConsole.open();
   ```

The planet images are read from `Planet_Images` inside the module folder.
