export default {
  id: "evereska",
  name: "Evereska",
  region: "Western Heartlands",
  sources: [
    { id: "vgsc", title: "Volo's Guide to the Sword Coast", pages: "128-132", publisher: "TSR", year: 1994 },
    { id: "frcg", title: "Forgotten Realms Campaign Guide", pages: "130-132", publisher: "Wizards of the Coast", year: 2008 },
    { id: "dd", title: "Demihuman Deities", pages: "134", publisher: "TSR", year: 1998 },
    { id: "fh", title: "Forsaken House", pages: "227-228", publisher: "Wizards of the Coast", year: 2004 }
  ],
  establishments: [
    { id: "unicorn-crescent", name: "Unicorn & Crescent", type: "inn", description: "Exclusive inn welcoming goodly organizations including the Harpers, Heralds, and Chosen of Mystra.", sourceIds: ["vgsc"] },
    { id: "hall-high-hunt-temple", name: "Hall of the High Hunt", type: "temple", district: "Moondark Hill", deity: "Solonor Thelandira", description: "Open-air temple centered on the Singing Spring.", sourceIds: ["dd", "frcg"] },
    { id: "hall-high-hunt-healer", name: "Hall of the High Hunt", type: "healer", district: "Moondark Hill", description: "The Singing Spring's restorative waters made the temple a place of healing for injured or ill elves.", sourceIds: ["dd"] },
    { id: "hall-high-hunt-town", name: "Hall of the High Hunt", type: "town-hall", district: "Moondark Hill", factions: ["Hill Elders"], description: "Meeting place of the Hill Elders who guided and protected Evereska.", sourceIds: ["frcg"] },
    { id: "cloudcrown-palace", name: "Cloudcrown Palace", type: "palace", district: "Cloudcrown Hill", description: "Ancient, heavily warded palace fashioned to resemble a stand of immense bluetop trees.", sourceIds: ["frcg"] },
    { id: "kaliesherai", name: "Hall of the Kaliesh'erai", type: "guildhall", factions: ["Kaliesh'erai"], description: "Headquarters and lore-vault of Evereska's association of elven psionicists.", sourceIds: ["frcg"] },
    { id: "college-magic-arms", name: "College of Magic and Arms", type: "school", district: "Southeastern Evereska", description: "Twin academies offering elite arcane and martial instruction, chiefly to elves.", sourceIds: ["vgsc", "frcg"] },
    { id: "sunset-gate", name: "Sunset Gate", type: "gatehouse", district: "Between West Cwm and Vine Vale", description: "Gate watched from a nearby stone guardhouse by Evereskan soldiers.", sourceIds: ["fh"] }
  ]
};
