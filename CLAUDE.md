# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Phaser 3 (arcade physics) + Vite browser platformer, built on the official Phaser Vite template. Deployed to GitHub Pages through GitHub Actions. Code identifiers, comments and commit messages are in **Spanish** (e.g. `salto`, `direccion`, `acelera`, `marcadores`). Keep that convention.

## Commands

- `npm install`: install dependencies
- `npm run dev`: dev server with hot reload at http://localhost:8080 (`vite/config.dev.mjs`)
- `npm run build`: production build to `dist/` (`vite/config.prod.mjs`)
- `npm run preview`: serves the production build from `dist/` at http://localhost:4173 (run `npm run build` first)
- Deployment: every push to `main` runs `.github/workflows/deploy.yml`, which builds and publishes `dist/` to GitHub Pages. There is no deploy script.

There are no tests and no linter.

## Verificación en navegador

With no tests, verify changes in a real browser with `agent-browser`. Run `agent-browser skills get core` first. Headless Chrome's `--screenshot` doesn't work here: it stays on the loading screen.

1. **Start the dev server** in the background: `npm run dev -- --strictPort`. The game is at **http://localhost:8080/**.
2. **Use your own session**: get a name with `agent-browser session id --scope worktree --prefix task` and pass `--session <name>` on every command.
3. **Open and wait**: `agent-browser open http://localhost:8080/`, then clear the logs with `console --clear` and `errors --clear`. Phaser 3.80 doesn't expose the game instance (`Phaser.GAMES` doesn't exist), so you can't wait for a scene. Wait for the canvas plus about 5 s while `Preloader` loads the assets. The game is a canvas, so check it with `screenshot`, not `snapshot`.
4. **Controls** (from `MainMenu` press `Enter` or `Space` to start):
   - Move: `keydown ArrowRight` / `keyup ArrowRight` (or `ArrowLeft`).
   - Jump: `Space`. Hold it for a full jump, or tap it for a short one.
   - Run: hold `Shift`. Crouch, as big Mario: `ArrowDown`. Pause: `P`.
   - In `GameOver`, `Space` returns to the menu.
   - A key held across a scene restart (for example after a death) isn't seen by the new scene, so send a new `keydown`.
5. **Inspect game state**: in dev, Vite serves the same module instance by URL, so `eval` can read it. For example, `import('/src/scenes/settings.js').then(m => m.Settings.marcadores)` returns lives, points, time and so on. To measure timings (deaths, timers), record them inside the page with `performance.now()`. Each CLI command adds its own latency, so shell timestamps mislead.
6. **Check**:
   - `agent-browser console` and `agent-browser errors`. The only expected messages are Vite's `connecting`/`connected` and the Phaser version banner.
   - The menu renders, a game starts (HUD shows, time counts down), and the flow you touched works: death → restart with one life fewer → `GameOver` → menu.
   - The feature you changed works, checked with screenshots and/or state read through `eval`.
7. **Clean up**: run `agent-browser --session <name> close` and stop the server. On Windows, stopping the background task can leave Vite's `node.exe` listening on port 8080. Find it with `Get-NetTCPConnection -LocalPort 8080`, check that its command line is this project's `vite`, stop it, and confirm the port is free.

**Don't consider a task finished if the console or `errors` shows any error.** Fix it first, or report it explicitly with its message.

## Architecture

**Scene flow** (`src/main.js`): `Boot` → `Preloader` → `MainMenu` → `Game` (→ `GameOver` → `MainMenu`). `MainMenu` resets the game state (`Settings.nuevaPartida()`), loads the saved record, and starts `Game` from the "Nueva Partida" button or SPACE/ENTER. Starting with a touch enables mobile controls straight away. Pause (P/ESC, the on-screen button, or losing focus) pauses `Game` and launches the overlay scene `Pausa`, because a paused scene receives no input. `Pausa` resumes `Game`. Only the sounds that were playing are paused and resumed. Listeners added to `this.game.events` or `this.events` survive scene restarts, so remove them on `shutdown`. The canvas is 768×480 with `Scale.FIT`, `pixelArt: true` and arcade gravity `y: 1100`.

**Asset loading**: everything is loaded in `src/scenes/Preloader.js` from `public/assets/`. That includes the Tiled map (`mario-level-1-1.json`, layer `World1`, tileset `SuperMarioBros-World1-1` → image `super_mario.png`), the spritesheets and the audio. The virtual joystick (`phaser3-rex-plugins`) is registered as a global plugin in `src/main.js` under the key `rexvirtualjoystickplugin`. `import 'phaser'` must stay before the plugin import, because the plugin uses the global `Phaser` when its module is evaluated.

**Central config: `src/scenes/settings.js`**. A static `Settings` class holds all tunables and shared mutable state:
- The tile-index legend for the tilemap is in the header comment. Game logic hardcodes these indices, e.g. 14 = question block, 15 = brick, 16 = pyramid block, 21–22/27–28 = pipe, 40 = ground, 1 = sky.
- `screen.TILE_X/Y` (16) and `layer1.scaleX/Y` (2). **World pixel coords = tile coords × 16 × 2.** All spawn positions (`ARRAY_GOOMBAS`, `COLLIDERS_INVISIBLES`, Mario's start) are given in tile units and converted with this formula.
- `controls.MOBILE` toggles keyboard vs joystick input at runtime.
- `marcadores` holds the score state. The record (`hi`) and its owner's name (`hiNombre`) are saved in `localStorage` (`cargarRecord`, `actualizarRecord`, `guardarNombreRecord`). `GameOver` asks for the name with the on-screen keyboard `TecladoNombre` when the record was beaten during the game.

**Component pattern** (`src/components/`): each game object is a plain class created with `new X(scene, args)` in `Game.init()`. It builds its Phaser objects in `create()` (called from `Game.create()`), may have an `update()` called from `Game.update()`, and exposes the underlying sprite/group via `get()`. Components keep the scene as `this.relatedScene` and reach other components through it (e.g. `Goombas` reads `this.relatedScene.mario.get()`). Sounds are created in `Game.init()` as scene properties (`this.sonido_jumpbros`, `this.bricks_fall`, ...) and played through `play_sonidos()`.

**Game scene wiring** (`src/scenes/Game.js`):
- `ajustes_tiles()` replaces coin and mushroom tiles with sky after the map is created.
- `set_colliders()` sets which tile indices are solid and registers the colliders and overlaps.
- Two cameras: the main one follows Mario and is bounded to the map, and a second `view-scores` camera at the top renders the HUD. HUD objects are placed at negative Y (`scrollY: -32`) so only that camera sees them.
- The physics world's right bound ends just past the flagpole (`Settings.FIN_NIVEL.MASTIL_X`), so Mario can't jump over it. `FinNivel` (`src/components/fin-nivel.js`) detects contact with the pole and runs the end-of-level sequence. During that sequence Mario's body is disabled and tweens move him. At the end it restarts the scene, keeping points, coins and lives.
- Tapping the bottom-left third of the screen switches to mobile controls: a horizontal-only joystick (pushed near the edge = run) and a jump button `BotonSalto` (`botonycruceta.js`) that exposes `isDown`/`isUp` like a key. Multi-touch needs `input.activePointers` in `main.js`.

**Collision logic** lives in `src/utils/functions.js`:
- `hitBrick`: big Mario breaks bricks (particles and points), small Mario only bumps them. A question block becomes tile 41 (the "used" question block, solid but not hittable again) and releases its contents after the bump.
- Block contents: in the Tiled map, item tiles (11 = coin, 12 = red mushroom, 18 = 1up, 19 = star) are drawn directly above their `?` block. `Game.ajustes_tiles()` records them in `this.contenidoBloques` (keyed `"x,y"` of the block), then replaces them with sky. `Monedas` spawns coins as soon as the block is hit. `Setas` spawns mushrooms and the star after the bump; the star keeps bouncing. Multi-coin bricks aren't in the map: they come from `Settings.LADRILLOS_MONEDAS` and are tracked in `Game.ladrillosMonedas`.
- `hitVsGoombas`: stomping a goomba squashes it and bounces Mario. With the star, any contact kills the goomba. Otherwise any other contact calls `mario.recibirGolpe()`: big Mario shrinks and is invulnerable for a short time, small Mario dies.

**State that survives losing a life**: `Settings.nivel` stores tiles changed during play (broken bricks, used `?` blocks), the multi-coin brick state, and whether Mario has passed `Settings.CHECKPOINT`. Change map tiles during play through `cambiar_tile()` so the change is recorded. `ajustes_tiles()` reapplies the changes after a restart. On restart, Mario respawns at the checkpoint, and goombas behind it aren't created. `Settings.reiniciarNivel()` clears this state when a new game starts or the level is completed.

Before restarting, the scene waits for long sounds to finish (death, level-up), because restarting destroys them (`ms_restantes()`).

**Mario state** is kept in sprite data (`muerto`, `grande`, `transformando`, `invulnerable`, `estrella`, `level-up`). `update()` does nothing while dead or transforming. Crouching (`this.agachado`, big Mario only, down arrow or joystick down) shrinks the body to 1 tile at the bottom of the frame. Mario only stands up when on the ground and there is room above (`hayEspacioParaLevantarse()`). `setGrande()` cancels crouching. Death and transformation call `physics.pause()`, which freezes the whole game; tweens and timers keep running. Animation keys exist in small and big versions (`mario-<action>` / `mario-grande-<action>`), and you should play them through `playAnim(action)`. After a death, `Game.perder_vida()` either restarts the scene or goes to `GameOver`. Animations and sounds are global, so they must be safe to create again on restart: use `crear_animacion()`, and the scene destroys its sounds on `shutdown`.

**Goomba AI**: goombas wait idle until Mario is within one screen width, then walk at `GOOMBA.VEL_X` with `bounce.x = 1`. `ColisionadoresInvisibles` places invisible static colliders (tile coords in `Settings.COLLIDERS_INVISIBLES`) that keep goombas from walking off ledges.
