export default {
  id: "hillsfar",
  name: "Hillsfar",
  region: "Moonsea",
  sources: [
    { id: "motm", title: "Mysteries of the Moonsea", pages: "46-49", publisher: "Wizards of the Coast", year: 2006 },
    { id: "fra", title: "Forgotten Realms Adventures", pages: "88-89", publisher: "TSR", year: 1990 },
    { id: "moonsea", title: "The Moonsea — Reference Guide", pages: "7-9", publisher: "TSR", year: 1995 }
  ],
  establishments: [
    { id: "mermaids-bosom", name: "The Mermaid's Bosom", type: "inn", sourceIds: ["motm"] },
    { id: "bugbears-cave", name: "Bugbear's Cave", type: "tavern", district: "Western Hillsfar", description: "Pub of note in the western part of the city.", sourceIds: ["fra"] },
    { id: "dragons-lair", name: "Dragon's Lair", type: "tavern", description: "Good-quality tavern.", sourceIds: ["fra"] },
    { id: "hydras-den", name: "Hydra's Den Tavern", type: "tavern", district: "Southwestern Hillsfar", description: "Busy pub in the city's southwest.", sourceIds: ["fra"] },
    { id: "rats-nest", name: "The Rat's Nest", type: "tavern", factions: ["Red Plumes"], description: "Favored drinking place of off-duty Red Plumes.", sourceIds: ["fra"] },
    { id: "rusty-nail", name: "The Rusty Nail", type: "tavern", sourceIds: ["motm"] },
    { id: "tityss-emporium", name: "Titys's Emporium", type: "general-store", description: "Well-stocked general store that bought adventurers' goods without questions.", sourceIds: ["moonsea"] },
    { id: "house-happiness", name: "House of Happiness", type: "temple", deity: "Lliira", sourceIds: ["fra"] },
    { id: "lastholme", name: "Lastholme", type: "temple", deity: "Chauntea", sourceIds: ["fra"] },
    { id: "vault-swords", name: "The Vault of Swords", type: "temple", deity: "Tempus", description: "Large temple complex dedicated to Tempus.", sourceIds: ["fra"] },
    { id: "castle-maalthiir", name: "Castle Maalthiir", type: "palace", aliases: ["Vultureroost"], description: "Great stronghold and seat of Maalthiir's rule.", sourceIds: ["fra"] }
  ]
};
