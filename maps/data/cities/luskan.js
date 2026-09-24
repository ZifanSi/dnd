export default {
  id: "luskan",
  name: "Luskan",
  region: "Sword Coast North",
  era: "Entries span the late 14th and late 15th centuries DR; individual status notes identify closures.",
  sources: [
    { id: "vgn", title: "Volo's Guide to the North", pages: "110-118", publisher: "TSR", year: 1993 },
    { id: "north", title: "The North: Guide to the Savage Frontier — Cities & Civilization", pages: "22-25", publisher: "TSR", year: 1996 },
    { id: "skt", title: "Storm King's Thunder", pages: "97-98", publisher: "Wizards of the Coast", year: 2016 }
  ],
  establishments: [
    { id: "one-eyed-jax", name: "One-Eyed Jax", type: "inn", district: "North Bank", factions: ["Ship Kurth", "Bregan D'aerthe"], description: "Reliable post-Spellplague inn and tavern overtly protected by Ship Kurth.", sourceIds: ["skt"] },
    { id: "royal-arms", name: "The Royal Arms", type: "inn", description: "Expensive inn favored by wealthy traders and dignitaries.", sourceIds: ["vgn"] },
    { id: "seven-sails", name: "Seven Sails Inn", type: "inn", district: "Setting Sun Street", description: "Comparatively restful inn watched closely by the Arcane Brotherhood.", sourceIds: ["vgn"] },
    { id: "cutlass", name: "The Cutlass", type: "tavern", district: "Dragon Beach", description: "Busy dockside tavern frequented by pirate crews; Wulfgar once worked here as a bouncer.", sourceIds: ["north"] },
    { id: "calling-conch", name: "Calling Conch", type: "tavern", district: "Docks", description: "Dockside tavern known for ale and chowder.", sourceIds: ["vgn"] },
    { id: "icecutter", name: "Icecutter", type: "tavern", district: "Piers", description: "Rundown but clean tavern beside Luskan's longest wharf.", sourceIds: ["vgn"] },
    { id: "clearlight", name: "Clearlight", type: "temple", deity: "Tymora", factions: ["Coin Spinners"], description: "Dilapidated Tymoran temple later used as a gang base.", sourceIds: ["north"] },
    { id: "temple-of-red-sails", name: "Temple of Red Sails", type: "temple", deity: "Umberlee", description: "Luskan's temple to the sea goddess Umberlee.", sourceIds: ["north"] },
    { id: "temple-of-auril", name: "Temple of Auril", type: "temple", deity: "Auril", era: "late 15th century DR", description: "A great complex of soaring white spires dedicated to the Frostmaiden.", sourceIds: ["skt"] },
    { id: "prisoners-carnival", name: "Prisoners' Carnival", type: "prison", district: "The Market", description: "Public court, punishment, torture, and execution ground rather than a conventional jail.", sourceIds: ["north"] },
    { id: "order-burning-dawn", name: "Guildhall of the Order of the Burning Dawn", type: "guildhall", factions: ["Order of the Burning Dawn"], sourceIds: ["north"] },
    { id: "balivers-house-of-horses", name: "Baliver's House of Horses", type: "stable", description: "Stablehouse still operating in 1483 DR and offering pony lodging.", sourceIds: ["skt"] },
    { id: "north-gate", name: "North Gate", type: "gatehouse", description: "Fortified northern entrance guarded by Luskan soldiers.", sourceIds: ["north"] },
    { id: "south-gate", name: "South Gate", type: "gatehouse", sourceIds: ["north"] }
  ]
};
