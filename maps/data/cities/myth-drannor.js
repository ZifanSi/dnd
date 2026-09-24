export default {
  id: "myth-drannor",
  name: "Myth Drannor",
  region: "Cormanthor",
  status: "ruined after 1487 DR",
  era: "Most establishments are historical sites of Cormanthyr before the city's first fall in 714 DR. The city was restored in the 15th century and destroyed again in 1487 DR.",
  sources: [
    { id: "cormanthyr", title: "Cormanthyr: Empire of the Elves", pages: "54-82", publisher: "TSR", year: 1998 },
    { id: "rmd", title: "Ruins of Myth Drannor", publisher: "TSR", year: 1993 }
  ],
  establishments: [
    { id: "ample-chalice", name: "Ample Chalice", type: "inn", status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "pipe-unicorn", name: "Pipe & Unicorn", type: "tavern", status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "tyryls-tankards", name: "Tyryl's Tankards", type: "tavern", status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "samblars-swords", name: "Samblar's Swords", type: "blacksmith", district: "Cormanthor", status: "historical/ruined", description: "Bladesmith whose work combined elven and dwarven influences.", sourceIds: ["cormanthyr"] },
    { id: "house-song-temple", name: "House of Song", type: "temple", district: "Cormanthor", deity: "Oghma", status: "historical/ruined", description: "Fortress-temple holding an unmatched collection of songs and ballads.", sourceIds: ["cormanthyr"] },
    { id: "temple-sehanine", name: "Temple of Sehanine Moonbow", type: "temple", district: "Sheshyrinnam", deity: "Sehanine Moonbow", status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "lovers-glade", name: "Lovers' Glade", type: "temple", district: "Dlabraddath", deity: "Sune", status: "historical/ruined", description: "Pool and glade serving as an open temple to Sune.", sourceIds: ["cormanthyr"] },
    { id: "merethyls-ministrations", name: "Merethyl's Ministrations", type: "bathhouse", district: "Kerradunath", status: "historical/ruined", description: "Three-story luxury public bathhouse built among the boughs of a living tree.", sourceIds: ["cormanthyr"] },
    { id: "open-book", name: "Hall of the Open Book", type: "guildhall", district: "Kerradunath", factions: ["Lorekeepers' Alliance"], status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "beast-tamers", name: "Halls of the Beast-Tamers", type: "guildhall", district: "Dlabraddath", factions: ["Guild of Naturalists"], status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "wing-stables", name: "Wing Stables", type: "stable", status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "ursplindaar", name: "Ursplindaar", type: "library", district: "Cormanthor", status: "historical/ruined", description: "Four-story fortified library.", sourceIds: ["cormanthyr"] },
    { id: "irithlium", name: "The Irithlium", type: "school", district: "Kerradunath", status: "historical/ruined", description: "Legendary arcane academy built over three centuries.", sourceIds: ["cormanthyr"] },
    { id: "incanistaeum", name: "The Incanistaeum", type: "school", district: "Dlabraddath", status: "historical/ruined", description: "Magic school overseen by the Seven Wizards of Myth Drannor.", sourceIds: ["cormanthyr"] },
    { id: "jerroks-concert-hall", name: "Jerrok's Concert Hall", type: "theater", status: "ruined since the Weeping War", description: "Once-grand performance hall with magically perfect acoustics.", sourceIds: ["cormanthyr", "rmd"] },
    { id: "south-barracks", name: "South Barracks", type: "barracks", status: "historical/ruined", sourceIds: ["cormanthyr"] },
    { id: "silversgate", name: "Silversgate", type: "gatehouse", status: "historical/ruined", sourceIds: ["cormanthyr"] }
  ]
};
