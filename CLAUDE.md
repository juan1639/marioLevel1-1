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

**Asset loading**: everything is loaded in `src/scenes/Preloader.js` from `public/assets/`. That includes the Tiled map (`mario-level-1-1.json`, layer `World1`, tileset `SuperMarioBros-World1-1` → image `super_mario.png`), the spritesheets and the audio. The virtual joystick plugin (`rexvirtualjoystickplugin`) is loaded **at runtime from a GitHub raw URL**, so mobile controls need network access.

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
- The physics world's right bound is intentionally shorter than the map. `Mario.checkLevelUp()` uses that bound as the flag/level-end trigger.
- Tapping the bottom-left third of the screen switches to mobile (joystick) controls.

**Collision logic** lives in `src/utils/functions.js`:
- `hitBrick`: when Mario's head hits a brick, the brick turns into sky and gives particles and points. When it hits a question block, the block plays a bump tween (`AnimaBloques`).
- `hitVsGoombas`: stomping a goomba squashes it and bounces Mario. Any other contact resets Mario to the start position.

**Goomba AI**: goombas wait idle until Mario is within one screen width, then walk at `GOOMBA.VEL_X` with `bounce.x = 1`. `ColisionadoresInvisibles` places invisible static colliders (tile coords in `Settings.COLLIDERS_INVISIBLES`) that keep goombas from walking off ledges.
