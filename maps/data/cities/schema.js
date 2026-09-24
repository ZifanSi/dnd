// Canonical taxonomy requested by the map data contract. A missing category is
// represented by no record at all; city files never contain speculative blanks.
export const ESTABLISHMENT_TYPES = Object.freeze([
  "inn",
  "tavern",
  "general-store",
  "blacksmith",
  "temple",
  "healer",
  "guardhouse",
  "prison",
  "town-hall",
  "palace",
  "guildhall",
  "stable",
  "warehouse",
  "bank",
  "library",
  "school",
  "bathhouse",
  "theater",
  "barracks",
  "gatehouse"
]);

const TYPE_SET = new Set(ESTABLISHMENT_TYPES);

/**
 * Validate one city module. Returns human-readable errors and performs no I/O.
 * Optional establishment fields: district, description, status, era, deity,
 * deities, factions, aliases. `sourceIds` must resolve against the city's
 * official-source bibliography.
 */
export function validateCityData(city) {
  const errors = [];
  const at = message => errors.push(`${city?.name ?? "<unknown city>"}: ${message}`);

  if (!city || typeof city !== "object") return ["City export must be an object"];
  for (const key of ["id", "name", "region"]) {
    if (typeof city[key] !== "string" || !city[key].trim()) at(`missing non-empty ${key}`);
  }
  if (!Array.isArray(city.sources) || city.sources.length === 0) at("sources must be a non-empty array");
  if (!Array.isArray(city.establishments)) at("establishments must be an array");

  const sourceIds = new Set();
  for (const source of city.sources ?? []) {
    if (!source?.id || !source?.title) at("every source requires id and title");
    if (sourceIds.has(source?.id)) at(`duplicate source id ${source.id}`);
    sourceIds.add(source?.id);
  }

  const establishmentIds = new Set();
  const establishmentKeys = new Set();
  for (const place of city.establishments ?? []) {
    if (!place?.id || !place?.name || !place?.type) at("every establishment requires id, name, and type");
    if (establishmentIds.has(place?.id)) at(`duplicate establishment id ${place.id}`);
    establishmentIds.add(place?.id);
    const establishmentKey = `${place?.name}\u0000${place?.type}`;
    if (establishmentKeys.has(establishmentKey)) at(`duplicate ${place.name} record for type ${place.type}`);
    establishmentKeys.add(establishmentKey);
    if (!TYPE_SET.has(place?.type)) at(`${place?.name ?? place?.id}: unsupported type ${place?.type}`);
    if (!Array.isArray(place?.sourceIds) || place.sourceIds.length === 0) {
      at(`${place?.name ?? place?.id}: sourceIds must be non-empty`);
    } else {
      for (const sourceId of place.sourceIds) {
        if (!sourceIds.has(sourceId)) at(`${place.name}: unknown source id ${sourceId}`);
      }
    }
  }

  return errors;
}
