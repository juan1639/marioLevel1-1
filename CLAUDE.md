# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Phaser 3 (arcade physics) + Vite browser platformer, built on the official Phaser Vite template. Deployed to GitHub Pages. Code identifiers, comments and commit messages are in **Spanish** (e.g. `salto`, `direccion`, `acelera`, `marcadores`). Keep that convention.

## Commands

- `npm install`: install dependencies
- `npm run dev`: dev server with hot reload at http://localhost:8080 (`vite/config.dev.mjs`)
- `npm run build`: production build to `dist/` (`vite/config.prod.mjs`)
- `npm run deploy`: builds, then publishes `dist/` to GitHub Pages via `gh-pages`

There are no tests and no linter.

## Architecture

**Scene flow** (`src/main.js`): `Boot` → `Preloader` → `MainMenu` → `Game` (→ `GameOver`). The canvas is 768×480 with `Scale.FIT`, `pixelArt: true` and arcade gravity `y: 1100`.

**Asset loading**: everything is loaded in `src/scenes/Preloader.js` from `public/assets/`. That includes the Tiled map (`mario-level-1-1.json`, layer `World1`, tileset `SuperMarioBros-World1-1` → image `super_mario.png`), the spritesheets and the audio. The virtual joystick (`phaser3-rex-plugins`) is registered as a global plugin in `src/main.js` under the key `rexvirtualjoystickplugin`. `import 'phaser'` must stay before the plugin import, because the plugin uses the global `Phaser` when its module is evaluated.

**Central config: `src/scenes/settings.js`**. A static `Settings` class holds all tunables and shared mutable state:
- The tile-index legend for the tilemap is in the header comment. Game logic hardcodes these indices, e.g. 14 = question block, 15 = brick, 16 = pyramid block, 21–22/27–28 = pipe, 40 = ground, 1 = sky.
- `screen.TILE_X/Y` (16) and `layer1.scaleX/Y` (2). **World pixel coords = tile coords × 16 × 2.** All spawn positions (`ARRAY_GOOMBAS`, `COLLIDERS_INVISIBLES`, Mario's start) are given in tile units and converted with this formula.
- `controls.MOBILE` toggles keyboard vs joystick input at runtime.
- `marcadores` holds the score state.

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

Before restarting, the scene waits for long sounds to finish (death, level-up), because restarting destroys them (`ms_restantes()`).

**Mario state** is kept in sprite data (`muerto`, `grande`, `transformando`, `invulnerable`, `estrella`, `level-up`). `update()` does nothing while dead or transforming. Death and transformation call `physics.pause()`, which freezes the whole game; tweens and timers keep running. Animation keys exist in small and big versions (`mario-<action>` / `mario-grande-<action>`), and you should play them through `playAnim(action)`. After a death, `Game.perder_vida()` either restarts the scene or goes to `GameOver`. Animations and sounds are global, so they must be safe to create again on restart: use `crear_animacion()`, and the scene destroys its sounds on `shutdown`.

**Goomba AI**: goombas wait idle until Mario is within one screen width, then walk at `GOOMBA.VEL_X` with `bounce.x = 1`. `ColisionadoresInvisibles` places invisible static colliders (tile coords in `Settings.COLLIDERS_INVISIBLES`) that keep goombas from walking off ledges.
