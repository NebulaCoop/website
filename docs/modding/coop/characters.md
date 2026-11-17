---
title: Characters
shortTitle: Characters
intro: Add characters to the PLAYER page, give them their own player numbers, and pick a player's character from a mod.
contentType: reference
---

## About characters

NebulaCoop's characters work like sm64coopdx's character table. Mario is index 0 and Luigi is 1, and mods add more after them. A player picks one on the Options PLAYER page, where the CHARACTER row lists every character the running mods add. The other players in a room see the character's model.

A character is a **model on one of the game's two players**, its base, named by `like`. The base gives everything the game's code does for Mario or Luigi: the animations (MarioAnime.arc, with Luigi's swaps), voice, effects, the life icon and the game's own Luigi code. The character gives:

- **Its model**, `ObjectData/<archive>.arc`, with the model inside named as the archive (case doesn't matter). It needs the base's skeleton (its joint names), as a model that replaces `Mario.arc` does.
- **Its other models**, found by the game's names with the base's name swapped for the archive's: `MarioFace` becomes `WarioFace`, `MarioShadow` becomes `WarioShadow`, and the same for `MarioHandL`, `BeeMario`, `IceMario`, `InvincibleMario`, `HopperMario`, `BoneMario`, `TeresaMario`, `MarioTornado` and `BeeMarioWing`. A Luigi-based character swaps `Luigi` (`LuigiFace` becomes `WaluigiFace`), and `Mario` in the names both share (the hands, the bee's wings). One the mod doesn't ship is the base's. The files inside an archive keep the game's names (`InvincibleMario.brk` stays).
- **Its own player numbers**, a copy of the base's as the game has them, before any mod changed them. `player_constants` and `set_player_constant` change them by the character's id or index, so a movesets mod can give each character its own jump, speed and traction.

## In luma.json

A layer's `characters` adds them, and the mod says `"requires": ["characters"]`, so Nebula without characters refuses it:

```json
{
  "requires": ["characters"],
  "layers": [{
    "path": "layers/base",
    "characters": [
      { "id": "wario", "name": "WARIO", "like": "mario", "archive": "Wario" },
      { "id": "waluigi", "like": "luigi" }
    ],
    "player_constants": {
      "wario": { "mJumpHeight": [20.0, null, 30.0] }
    }
  }]
}
```

| Field | What it is |
|---|---|
| `id` | 1 to 31 of `a-z`, `0-9`, `_` and `-`; not `mario` or `luigi`. How saves, `player_constants` and online co-op name it. |
| `name` | As the PLAYER page shows it. The id in capitals when left out. |
| `like` | `mario` (the default) or `luigi`. |
| `archive` | The model's archive in ObjectData, without `.arc`. The id with a capital first letter when left out (`waluigi` reads `Waluigi.arc`). |
| `palette` | The colours its model's textures are painted in, by part: `{"cap": "5a22a0", "overalls": "202020"}`. A part left out is its base's. See [Colours](colours.md). |

The layer's `files/ObjectData/` holds the archives. An id another mod already took is refused and named in the log. A `player_constants` key that isn't `mario`, `luigi` or `both` is a character's id: its numbers are set once the character is added, by this mod or another one running.

## From code

| C (NebulaModApi) | Gives |
|---|---|
| `add_character(self, &class)` | Only in `nebula_plugin_start`: adds a character (NebulaCharacterClass: id, name, like, archive). Its index, or -1. |
| `character_count()` | How many characters there are (2 before any mod's). |
| `character_id(i)`, `character_name(i)` | A character's id and name; null past the last. |
| `character_like(i)` | Its base: 0 Mario, 1 Luigi; -1 past the last. |
| `character_find(id)` | Its index by id, or -1. |
| `player_character()` | The index the player plays now. |
| `set_player_character_id(id)` | Picks the player's character instead of the PLAYER page's, as sm64coopdx's `overrideModelIndex`; null or `""` gives the page's back. In a stage the player's spot reloads as it, and the room sees it. 1 done, 0 no such character. |
| `set_player_character(luigi)` | The same for Mario (0) or Luigi (1). |
| `set_player_constant(i, name, place, value)`, `player_constant(i, name, place)` | A character's numbers by its index. |
| `coop_character_id(i)` | The id of the character the room's player `i` plays; `coop_character(i)` is its base. |
| `registry_value("character", id)` | Its index too: the `character` registry lists every character. |

A script reaches these as `nebula.<name>`, and the room's as `coop.character_id`.

## Online

The room's players run the same mods, so each has every character. A player's character travels by its id. Another player's copy shows their character's model when this game has the character and its base is the one they play; otherwise it shows the base. Copies of the characters the room plays are made as each stage starts, so a player who switches to a mod's character mid-stage shows as its base until the next start.

## Not yet

A character's own animations, voice and life icon: it uses its base's.
