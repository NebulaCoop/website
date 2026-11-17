---
title: Colours
shortTitle: Colours
intro: Players' colours, as sm64coopdx's palettes, a character's own palette, and changing colours from a mod.
contentType: reference
---

## Parts

A player's colours work like sm64coopdx's palettes: eight parts, each a colour. The `part` numbers and luma.json's names:

| # | Name | Covers |
|---|---|---|
| 0 | `pants` (or `overalls`) | the overalls |
| 1 | `shirt` | the shirt |
| 2 | `gloves` | the gloves |
| 3 | `shoes` | the shoes |
| 4 | `hair` | the hair, moustache and eyebrows |
| 5 | `skin` | the face, ears and eyelids |
| 6 | `cap` | the cap |
| 7 | `emblem` | the letter on the cap |

A player picks theirs on the Options PLAYER page, under COLOURS. SET gives a whole set: OWN for their character's own colours, any character's, or a few more such as FIRE MARIO, WARIO and TOAD. A row for each part steps through named colours. Each player's colours travel with their character, so everyone in a room sees them.

## From code

| C (NebulaModApi) | Gives |
|---|---|
| `character_palette_color(i, part)` | A character's own colour for a part (0xRRGGBB), -1 past the last. |
| `player_palette_color(part)` | The colour the player wears now for a part (theirs, with a mod's over it). |
| `set_player_palette_color(part, color)` | A mod's colour for a part over the player's, as sm64coopdx's `network_player_set_override_palette_color`. A negative colour takes it off. The room sees it. 1 done, 0 no such part. |
| `reset_player_palette()` | Takes every mod colour off. |
| `coop_palette_color(i, part)` | The colour the room's player `i` wears for a part, -1 for no such player. |

## How a palette is drawn

The game's player models carry their colours in their textures, so a palette is drawn by recoloured copies of those textures, made as the player's actor is made and remade when the colours change. The material's name says which parts its texture may hold: `Cap` the cap and emblem, `Body` the overalls, shirt and shoes, `Hair` the hair, `Face` and `EyeLid` the skin, `Hand` the gloves, and `Eye` none.

Each texel near a part's colour in the character's own palette takes the wanted colour at its own lightness. Texels near none (the buttons, the eyes, outlines, the white around the emblem) stay as they are. The emblem is a patch of the cap's or emblem's colour ringed by light texels, away from the texture's edges.

A mod character's model works the same way when its materials use those names and its `palette` says the colours its textures are painted in. A part it leaves out is taken to be its base's. See [Characters](characters.md).
