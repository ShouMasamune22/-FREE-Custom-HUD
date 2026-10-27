## Requirements

- **FiveM Server** — Required to run the resource.
- **NX-CORE** — Core framework dependency.
  - Repository: https://github.com/ShouMasamune22/NX-CORE
- **NX-SHARED** — Shared configuration, utilities, logging, localization, and bridge dependency.
  - Repository: https://github.com/ShouMasamune22/nx_shared

## Installation

1. Download or clone **NX-CORE** and place the resource folder as `nx_core` inside your server's `resources` directory.
2. Download or clone **NX-SHARED** and place the resource folder as `nx_shared` inside your server's `resources` directory.
3. Download or clone **NX-HUD** and place the resource folder as `nx_hud` inside your server's `resources` directory.
4. Ensure the resource folders are named correctly and their `fxmanifest.lua` files are located at each resource root.
5. Add the following lines to your `server.cfg`:

   ```cfg
   ensure nx_shared
   ensure nx_core
   ensure nx_hud
   ```

6. Restart your FiveM server and check the console for errors.

## Compatibility

- Platform: FiveM / GTA V
- HUD Version: 1.2.0
- Framework: QB-CORE framework
- Dependencies: `nx_shared`, `nx_core`
