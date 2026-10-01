// Registry of building models, keyed by the establishment type ids used in
// data/cities/schema.js (ESTABLISHMENT_TYPES), plus "house" for anonymous filler.
//
//   getBuildingGeometry(type, { variant, ruined })  -> cached THREE.BufferGeometry
//   (position + normal + vertex colour, metres, standing on y=0, front facing +z)
import { ModelBuilder, seededRandom } from "./kit.js";
import inn from "./inn.js";
import tavern from "./tavern.js";
import generalStore from "./general-store.js";
import blacksmith from "./blacksmith.js";
import temple from "./temple.js";
import healer from "./healer.js";
import guardhouse from "./guardhouse.js";
import prison from "./prison.js";
import townHall from "./town-hall.js";
import palace from "./palace.js";
import guildhall from "./guildhall.js";
import stable from "./stable.js";
import warehouse from "./warehouse.js";
import bank from "./bank.js";
import library from "./library.js";
import school from "./school.js";
import bathhouse from "./bathhouse.js";
import theater from "./theater.js";
import barracks from "./barracks.js";
import gatehouse from "./gatehouse.js";
import house from "./house.js";

export { LOT } from "./kit.js";

/** One model per establishment type, in the same order as ESTABLISHMENT_TYPES. */
export const ESTABLISHMENT_MODELS = [
  inn, tavern, generalStore, blacksmith, temple, healer, guardhouse, prison, townHall, palace,
  guildhall, stable, warehouse, bank, library, school, bathhouse, theater, barracks, gatehouse
];
export const MODELS = new Map([...ESTABLISHMENT_MODELS, house].map(m => [m.type, m]));

const cache = new Map();

/** Build (once) and return the merged geometry for a model type. */
export function getBuildingGeometry(type, { variant = 0, ruined = false } = {}) {
  const model = MODELS.get(type);
  if (!model) throw new Error(`No building model for type "${type}"`);
  const key = `${type}|${variant}|${ruined ? 1 : 0}`;
  if (!cache.has(key)) {
    const b = new ModelBuilder();
    model.build(b, seededRandom(variant * 7919 + 17));
    cache.set(key, b.toGeometry({ ruined }));
  }
  return cache.get(key);
}

export function getModel(type) {
  return MODELS.get(type);
}
