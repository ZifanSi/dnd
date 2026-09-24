export default {
  id: "gauntlgrym",
  name: "Gauntlgrym",
  region: "Sword Coast North / Northdark",
  era: "The named sites survive from ancient Delzoun and were present when the city was reclaimed in the late 15th century DR.",
  sources: [
    { id: "ncs", title: "Neverwinter Campaign Setting", pages: "128-135, 190-199", publisher: "Wizards of the Coast", year: 2011 },
    { id: "scag", title: "Sword Coast Adventurer's Guide", pages: "61-62", publisher: "Wizards of the Coast", year: 2015 },
    { id: "gauntlgrym", title: "Gauntlgrym", publisher: "Wizards of the Coast", year: 2010 }
  ],
  establishments: [
    { id: "great-forge", name: "Great Forge", type: "blacksmith", description: "Vast forge complex powered by the primordial Maegera; its furnaces could imbue crafted tools with a trace of primordial essence.", sourceIds: ["ncs", "gauntlgrym"] },
    { id: "iron-tabernacle", name: "Iron Tabernacle", type: "temple", deities: ["Moradin", "Morndinsamman"], description: "Immense central temple district containing multiple cathedrals, crypts, and the hub of the city's mine-cart network.", sourceIds: ["ncs", "gauntlgrym"] },
    { id: "shrine-of-sacrilege", name: "Shrine of Sacrilege", type: "temple", deity: "Asmodeus", status: "duergar shrine, circa 1480 DR", description: "A blasphemous shrine constructed in the deep mines from plundered Morndinsamman icons.", sourceIds: ["ncs"] }
  ]
};
