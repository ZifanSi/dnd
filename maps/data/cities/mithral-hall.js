export default {
  id: "mithral-hall",
  name: "Mithral Hall",
  region: "Silver Marches",
  sources: [
    { id: "sm", title: "Silver Marches", pages: "77-80", publisher: "Wizards of the Coast", year: 2002 },
    { id: "vgn", title: "Volo's Guide to the North", pages: "207-208", publisher: "TSR", year: 1993 }
  ],
  establishments: [
    { id: "undercity-forges", name: "Undercity Forges", type: "blacksmith", district: "Undercity", description: "The workshops and furnaces at the lowest level of the central cavern lit and warmed the settlement.", sourceIds: ["sm"] },
    { id: "moradins-forge", name: "Hall of Moradin's Forge", type: "temple", district: "Near the Great Wheel", deity: "Moradin", description: "The largest and most important temple in Mithral Hall.", sourceIds: ["sm"] },
    { id: "hall-of-dumathoin", name: "Hall of Dumathoin", type: "warehouse", deity: "Dumathoin", description: "Secure treasury and storehouse for Clan Battlehammer's weapons, armor, gems, jewelry, and other wealth.", sourceIds: ["vgn", "sm"] },
    { id: "main-entrance", name: "Main Entrance", type: "gatehouse", district: "Keeper's Dale", description: "Concealed western entrance defended by two enormous granite portals and the trap-filled Maze.", sourceIds: ["sm"] },
    { id: "surbrin-gate", name: "Surbrin Gate", type: "gatehouse", district: "Garumn's Gorge", description: "Small hidden eastern gate overlooking the River Surbrin, used mainly as an exit.", sourceIds: ["vgn"] }
  ]
};
