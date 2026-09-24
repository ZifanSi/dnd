import arabel from "./arabel.js";
import baldursGate from "./baldurs-gate.js";
import candlekeep from "./candlekeep.js";
import citadelAdbar from "./citadel-adbar.js";
import citadelFelbarr from "./citadel-felbarr.js";
import evereska from "./evereska.js";
import gauntlgrym from "./gauntlgrym.js";
import hillsfar from "./hillsfar.js";
import hlondeth from "./hlondeth.js";
import luskan from "./luskan.js";
import marsember from "./marsember.js";
import menzoberranzan from "./menzoberranzan.js";
import mirabar from "./mirabar.js";
import mithralHall from "./mithral-hall.js";
import murann from "./murann.js";
import mythDrannor from "./myth-drannor.js";
import neverwinter from "./neverwinter.js";
import silverymoon from "./silverymoon.js";
import ssTharTissSsun from "./ss-thar-tiss-ssun.js";
import sundabar from "./sundabar.js";
import waterdeep from "./waterdeep.js";
import zhentilKeep from "./zhentil-keep.js";

export const cityData = Object.freeze([
  arabel,
  baldursGate,
  candlekeep,
  citadelAdbar,
  citadelFelbarr,
  evereska,
  gauntlgrym,
  hillsfar,
  hlondeth,
  luskan,
  marsember,
  menzoberranzan,
  mirabar,
  mithralHall,
  murann,
  mythDrannor,
  neverwinter,
  silverymoon,
  ssTharTissSsun,
  sundabar,
  waterdeep,
  zhentilKeep
]);

export const cityDataById = new Map(cityData.map(city => [city.id, city]));
export const cityDataByName = new Map(cityData.map(city => [city.name.toLocaleLowerCase("en-US"), city]));

export function getCityData(nameOrId) {
  if (typeof nameOrId !== "string") return undefined;
  return cityDataById.get(nameOrId) ?? cityDataByName.get(nameOrId.toLocaleLowerCase("en-US"));
}
