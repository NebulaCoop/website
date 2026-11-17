---
title: Co-op mod files
shortTitle: Co-op mod files
intro: How a co-op mod says it needs NebulaCoop, and the .lumacoop file it is packed as.
contentType: reference
---

## What makes a mod a co-op mod

A mod that uses NebulaCoop's calls says so in its `luma.json`, with `"requires": ["coop"]`. A mod that adds characters also requires `"characters"`:

```json
{
  "requires": ["coop", "characters"]
}
```

[LumaLink Coop](https://github.com/NebulaCoop/lumalink-coop), NebulaCoop's copy of LumaLink, packs such a mod as a `.lumacoop` file instead of a `.luma` file. The format inside is the same. Plain Nebula refuses a `.lumacoop`, and a mod that requires `coop`, so players of plain Nebula never load a mod that can't work for them.

NebulaCoop imports both `.luma` and `.lumacoop` files. A plain `.luma` mod works in a room as it does in Nebula: the room's players all run it.

## In a room

- The host picks the room's mods on the Host page. The MODS page only imports and removes them.
- A player who joins downloads the mods they don't have from the host.
- The game version, the disc and the mods are checked as each player joins, so everyone in a room plays the same game.

## Building

Build and pack a co-op mod with LumaLink Coop as you would any mod. The `coop` names in LumaScript need LumaLink Coop's compiler: upstream LumaLink doesn't know them.
