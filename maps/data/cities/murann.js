export default {
  id: "murann",
  name: "Murann",
  region: "Amn / Muranndin",
  era: "The named establishments are documented in 1371 DR, around the Sothillisian conquest.",
  sources: [
    { id: "loi", title: "Lands of Intrigue — Amn", pages: "53-57", publisher: "TSR", year: 1997 }
  ],
  establishments: [
    { id: "asavirs-tankard", name: "Asavir's Tankard", type: "inn", description: "Clean, expensive inn run by a Calishite proprietor.", sourceIds: ["loi"] },
    { id: "captains-cabin", name: "Captain's Cabin", type: "tavern", description: "Cheap tavern serving many varieties of grog.", sourceIds: ["loi"] },
    { id: "riptide", name: "Riptide", type: "tavern", description: "Moderately priced tavern.", sourceIds: ["loi"] },
    { id: "sea-elfs-lover", name: "Sea Elf's Lover", type: "tavern", description: "Expensive festhall and tavern.", sourceIds: ["loi"] },
    { id: "swinging-berth", name: "Swinging Berth", type: "tavern", description: "Cheap tavern.", sourceIds: ["loi"] },
    { id: "moonmaidens-hall", name: "Moonmaiden's Hall", type: "temple", deity: "Selûne", description: "Temple fashioned from a ship's bow.", sourceIds: ["loi"] },
    { id: "storm-horn", name: "Storm Horn", type: "temple", deity: "Valkur", description: "Small temple led by Duil Dolphinson in 1371 DR.", sourceIds: ["loi"] },
    { id: "umberlee-temple", name: "Temple of Umberlee", type: "temple", deity: "Umberlee", sourceIds: ["loi"] }
  ]
};
