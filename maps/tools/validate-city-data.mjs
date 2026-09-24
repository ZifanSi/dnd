// Run from the repository root: node maps/tools/validate-city-data.mjs
import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { locations } from "../data/locations.js";
import { cityData, cityDataById, cityDataByName, getCityData } from "../data/cities/index.js";
import { ESTABLISHMENT_TYPES, validateCityData } from "../data/cities/schema.js";

const failures = [];
const fail = message => failures.push(message);
const expected = locations.filter(location => location.type === "city");
const expectedNames = new Set(expected.map(location => location.name));
const actualNames = new Set(cityData.map(city => city.name));

for (const location of expected) {
  const record = cityDataByName.get(location.name.toLocaleLowerCase("en-US"));
  if (!record) fail(`map city has no data file: ${location.name}`);
  if (record && getCityData(record.id) !== record) fail(`id lookup failed: ${record.id}`);
}
for (const city of cityData) {
  if (!expectedNames.has(city.name)) fail(`data file does not match a map city: ${city.name}`);
  failures.push(...validateCityData(city));
}
if (cityDataById.size !== cityData.length) fail("duplicate city id");
if (cityDataByName.size !== cityData.length) fail("duplicate canonical city name");
if (expectedNames.size !== actualNames.size) fail(`coverage mismatch: ${expectedNames.size} map cities, ${actualNames.size} data cities`);

const directory = fileURLToPath(new URL("../data/cities/", import.meta.url));
const supportFiles = new Set(["index.js", "schema.js"]);
const cityFiles = (await readdir(directory)).filter(file => file.endsWith(".js") && !supportFiles.has(file));
if (cityFiles.length !== cityData.length) fail(`${cityFiles.length} city files for ${cityData.length} city records`);

const counts = Object.fromEntries(ESTABLISHMENT_TYPES.map(type => [type, 0]));
let establishmentCount = 0;
for (const city of cityData) {
  for (const place of city.establishments) {
    counts[place.type]++;
    establishmentCount++;
  }
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.error(`\n${failures.length} failure(s)`);
  process.exit(1);
}

console.log(`${cityData.length}/${expected.length} map cities covered by ${cityFiles.length} city files.`);
console.log(`${establishmentCount} sourced establishment records validated.`);
console.log(Object.entries(counts).map(([type, count]) => `${type}: ${count}`).join(" | "));
