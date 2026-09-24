# City establishment data

Each map location whose `type` is `city` has one ES-module file in this directory. `index.js` is the programmatic entry point and exports:

- `cityData`: all city records
- `cityDataById`: lookup by stable canonical identifier
- `cityDataByName`: case-normalized lookup by canonical display name
- `getCityData(nameOrId)`: convenience lookup

Establishments use only the values in `schema.js`. A category with no documented canon location is omitted; there are no placeholder or generated businesses. One physical place may appear more than once when official lore gives it multiple requested functions (for example, a temple-library or palace-town hall).

`status` and `era` prevent historical or ruined locations from being presented as current. `sourceIds` resolve to the official Dungeons & Dragons or Forgotten Realms bibliography in the same city file. Descriptions are concise paraphrases, not copied source text.

Run the coverage and schema check from the repository root:

```text
node maps/tools/validate-city-data.mjs
```
