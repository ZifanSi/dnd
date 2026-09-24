export default {
  id: "arabel",
  name: "Arabel",
  region: "Cormyr",
  sources: [
    { id: "cormyr", title: "Cormyr", pages: "16-20, 32-33", publisher: "TSR", year: 1993 },
    { id: "fra", title: "Forgotten Realms Adventures", pages: "73-75", publisher: "TSR", year: 1990 },
    { id: "vgc", title: "Volo's Guide to Cormyr", pages: "52-63", publisher: "TSR", year: 1995 }
  ],
  establishments: [
    { id: "elfskull", name: "Elfskull Inn", type: "inn", sourceIds: ["cormyr"] },
    { id: "high-moon", name: "High Moon Inn", type: "inn", sourceIds: ["cormyr"] },
    { id: "murdered-manticore", name: "Murdered Manticore Inn", type: "inn", sourceIds: ["cormyr"] },
    { id: "night-wolf", name: "Night Wolf Inn", type: "inn", sourceIds: ["cormyr"] },
    { id: "nine-fires", name: "Nine Fires Inn", type: "inn", sourceIds: ["cormyr"] },
    { id: "weary-knight", name: "Weary Knight", type: "inn", sourceIds: ["cormyr"] },
    { id: "wild-goose", name: "Wild Goose", type: "inn", aliases: ["World Serpent Inn"], sourceIds: ["cormyr"] },
    { id: "bent-bow", name: "Bent Bow", type: "tavern", sourceIds: ["cormyr"] },
    { id: "black-mask", name: "Black Mask", type: "tavern", sourceIds: ["cormyr"] },
    { id: "dancing-dragon", name: "Dancing Dragon", type: "tavern", sourceIds: ["fra"] },
    { id: "dancing-dracolisk", name: "Dancing Dracolisk", type: "tavern", sourceIds: ["cormyr"] },
    { id: "wink-kiss", name: "Wink and Kiss", type: "tavern", sourceIds: ["cormyr"] },
    { id: "ladys-house", name: "Lady's House", type: "temple", aliases: ["Lady's Hall"], deity: "Tymora", description: "Arabel's most splendid cathedral, dedicated to Lady Luck.", sourceIds: ["cormyr"] },
    { id: "citadel", name: "The Citadel", type: "guardhouse", description: "Headquarters and fortress of Arabel's Purple Dragon garrison.", factions: ["Purple Dragons"], sourceIds: ["fra", "vgc"] },
    { id: "arabellan-palace", name: "Arabellan Palace", type: "palace", description: "Royal palace maintained for the Crown's use in Arabel.", sourceIds: ["vgc"] },
    { id: "baths", name: "The Baths", type: "bathhouse", sourceIds: ["fra"] },
    { id: "citadel-barracks", name: "The Citadel", type: "barracks", factions: ["Purple Dragons"], sourceIds: ["fra", "vgc"] },
    { id: "eastgate", name: "Eastgate", type: "gatehouse", sourceIds: ["vgc"] },
    { id: "high-horn-gate", name: "High Horn Gate", type: "gatehouse", sourceIds: ["vgc"] }
  ]
};
