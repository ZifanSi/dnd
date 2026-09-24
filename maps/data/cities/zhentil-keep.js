export default {
  id: "zhentil-keep",
  name: "Zhentil Keep",
  region: "Moonsea",
  era: "Most named sites describe the Keep before its destruction in 1368 DR; later sources describe a smaller rebuilt settlement. Historical sites are retained and explicitly marked.",
  sources: [
    { id: "rozk", title: "Ruins of Zhentil Keep — Campaign Book", pages: "7-29", publisher: "TSR", year: 1995 },
    { id: "motm", title: "Mysteries of the Moonsea", pages: "123-129", publisher: "Wizards of the Coast", year: 2006 }
  ],
  establishments: [
    { id: "silver-trumpet-inn", name: "Silver Trumpet Inn", type: "inn", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "tesh-inn", name: "Tesh Inn", type: "inn", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "axe-minotaur", name: "Axe and the Minotaur", type: "tavern", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "cloven-ogre", name: "Cloven Ogre", type: "tavern", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "dancing-coin", name: "The Dancing Coin", type: "tavern", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "mug-mutton", name: "The Mug and Mutton", type: "tavern", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "prosperity-emporium", name: "Prosperity Emporium", type: "general-store", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "litas-equipment", name: "Lita's Equipment", type: "general-store", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "luannas-forge", name: "Luanna's Forge", type: "blacksmith", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "black-altar", name: "The Black Altar", type: "temple", deity: "Bane", factions: ["Church of Bane", "Zhentarim"], description: "State temple and leading center of Banite worship.", sourceIds: ["rozk"] },
    { id: "circle-darkness", name: "Circle of Darkness", type: "temple", deity: "Bane", sourceIds: ["rozk"] },
    { id: "high-house-hunt", name: "High House of the Hunt", type: "temple", deity: "Malar", sourceIds: ["rozk"] },
    { id: "palace-sweet-pain", name: "Palace of Sweet Pain", type: "temple", deity: "Loviatar", sourceIds: ["rozk"] },
    { id: "tymoras-holy-hall", name: "Tymora's Holy Hall of Good Fortune and Casino", type: "temple", deity: "Tymora", sourceIds: ["rozk"] },
    { id: "battlehall", name: "Battlehall", type: "temple", deity: "Tempus", sourceIds: ["rozk"] },
    { id: "detention-center", name: "Detention Center", type: "prison", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "hall-rulership", name: "Hall of Rulership", type: "town-hall", status: "pre-1368 DR", description: "Seat of the city's governing council.", sourceIds: ["rozk"] },
    { id: "high-hall", name: "High Hall", type: "palace", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "thieves-guildhall", name: "Thieves' Guildhall", type: "guildhall", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "on-four-feet", name: "On Four Feet", type: "stable", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "bath-house", name: "The Bath House", type: "bathhouse", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "riverbank-theater", name: "Riverbank Theater", type: "theater", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "zhentilar-headquarters", name: "Zhentilar Headquarters", type: "barracks", factions: ["Zhentilar"], status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "north-force-gate", name: "North Force Gate", type: "gatehouse", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "south-force-gate", name: "South Force Gate", type: "gatehouse", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "dragon-gate", name: "Dragon Gate", type: "gatehouse", status: "pre-1368 DR", sourceIds: ["rozk"] },
    { id: "river-trail-gate", name: "River Trail Gate", type: "gatehouse", status: "pre-1368 DR", sourceIds: ["rozk"] }
  ]
};
