---
title: Co-op modding
shortTitle: Co-op
intro: Make mods for NebulaCoop's online rooms, add characters and set the colours players wear.
contentType: reference
---

## About co-op modding

NebulaCoop adds calls and events for online play to Nebula's mods, modeled on [sm64coopdx](https://github.com/coop-deluxe/sm64coopdx)'s Lua API. A mod can see who is in the room, where each player is and when that changes. Mods can also add characters, as sm64coopdx's character table, and set the colours players wear, as its palettes.

Mods are the room's: the host picks them, and every player who joins gets them from the host, so every player runs the same mods.

## Pages

| Page | What it covers |
|---|---|
| [Co-op mod files](co-op-mod-files.md) | How a co-op mod says it needs NebulaCoop, and the `.lumacoop` file. |
| [Players and events](players-and-events.md) | The `coop` calls: who is in the room, where they play, and the co-op events. |
| [Characters](characters.md) | Adding characters to the PLAYER page, and their own player numbers. |
| [Colours](colours.md) | Players' colours, a character's palette, and changing colours from a mod. |
| [Built-in mods](built-in-mods.md) | The mods that come with NebulaCoop, and where their source is. |
