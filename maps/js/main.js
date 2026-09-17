// Entry point: wire the data, per-city 3D overrides, and the map view together.
import { locations } from "../data/locations.js";
import { registerCityConfig } from "./city-scene.js";
import { initMapView } from "./map-view.js";

import baldursGateConfig from "./cities/baldurs-gate.js";
import waterdeepConfig from "./cities/waterdeep.js";

// Locations without a registered config fall back to the generic city/town
// template inside city-scene.js. Add more cities/*.js files and register them
// here to customize any other place.
registerCityConfig("Baldur's Gate", baldursGateConfig);
registerCityConfig("Waterdeep", waterdeepConfig);

initMapView(locations);
