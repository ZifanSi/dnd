export default {
  id: "neverwinter",
  name: "Neverwinter",
  region: "Sword Coast North",
  era: "Named sites are canon across the 14th- and 15th-century versions of the city; era notes flag sites affected by the Ruining.",
  sources: [
    { id: "vgn", title: "Volo's Guide to the North", pages: "130-134", publisher: "TSR", year: 1993 },
    { id: "ncs", title: "Neverwinter Campaign Setting", pages: "138-159", publisher: "Wizards of the Coast", year: 2011 },
    { id: "scag", title: "Sword Coast Adventurer's Guide", pages: "51-53", publisher: "Wizards of the Coast", year: 2015 },
    { id: "nwn", title: "Neverwinter Nights", publisher: "BioWare / Atari", year: 2002 },
    { id: "aol", title: "Neverwinter Nights (AOL game)", publisher: "Strategic Simulations / AOL", year: 1991 },
    { id: "nw", title: "Neverwinter", publisher: "Cryptic Studios / Perfect World", year: 2013 }
  ],
  establishments: [
    { id: "moonstone-mask", name: "Moonstone Mask", type: "inn", district: "Blacklake District", description: "Famous inn and festhall whose reputation extended far beyond Neverwinter.", sourceIds: ["vgn", "ncs"] },
    { id: "shining-serpent", name: "Shining Serpent Inn", description: "One of old Neverwinter's best-known inns.", type: "inn", sourceIds: ["vgn"] },
    { id: "beached-leviathan", name: "Beached Leviathan", type: "tavern", district: "Protector's Enclave docks", description: "Ship-hulk tavern popular during the city's late-15th-century rebuilding.", sourceIds: ["ncs"] },
    { id: "driftwood-tavern", name: "Driftwood Tavern", type: "tavern", district: "Protector's Enclave", factions: ["Sons of Alagondar"], description: "Popular tavern and gathering place for old Neverwintan families.", sourceIds: ["ncs"] },
    { id: "fallen-tower", name: "Fallen Tower", type: "tavern", district: "River District", description: "Tavern built around the shell of a ruined wizard's tower.", sourceIds: ["vgn", "ncs"] },
    { id: "shining-knight", name: "Shining Knight Arms & Armor", type: "blacksmith", description: "Named arms-and-armor shop in Neverwinter.", sourceIds: ["nwn"] },
    { id: "hall-of-justice", name: "Hall of Justice", type: "temple", district: "City Core / Protector's Enclave", deity: "Tyr", description: "Tyrran temple that also housed the city's public ruling offices; later rededicated to Torm before Tyr's return.", sourceIds: ["vgn", "ncs", "scag"] },
    { id: "house-of-knowledge", name: "House of Knowledge", type: "temple", district: "River District", deity: "Oghma", description: "Many-windowed temple of Oghma and center of learning.", sourceIds: ["vgn", "ncs"] },
    { id: "cathedral-of-mystra", name: "Cathedral of Mystra", type: "temple", deity: "Mystra", sourceIds: ["nwn"] },
    { id: "hallowed-temple-selune", name: "Hallowed Temple of Selûne", type: "temple", deity: "Selûne", sourceIds: ["ncs"] },
    { id: "neverwinter-health-society", name: "Neverwinter Health Society", type: "bathhouse", status: "abandoned by 1357 DR", description: "Social club, spa, and gloveball complex whose pool had dried up by 1357 DR.", sourceIds: ["aol"] },
    { id: "neverwinter-prison", name: "Neverwinter Prison", type: "prison", district: "Peninsula District", sourceIds: ["nwn"] },
    { id: "hall-of-justice-government", name: "Hall of Justice", type: "town-hall", district: "City Core / Protector's Enclave", description: "Besides its religious function, the Hall served as the ruler's public office and civic seat.", sourceIds: ["vgn", "ncs"] },
    { id: "castle-never", name: "Castle Never", type: "palace", district: "Blacklake District", description: "Castle of Neverwinter's rulers and ancestral seat of the Alagondar line.", sourceIds: ["vgn", "ncs"] },
    { id: "merchant-guild-hall", name: "Merchant Guild Hall", type: "guildhall", district: "Merchant Quarter", sourceIds: ["nwn"] },
    { id: "shaundakul-stables", name: "Shaundakul Stables", type: "stable", sourceIds: ["nwn"] },
    { id: "counting-house", name: "Counting House", type: "bank", sourceIds: ["nwn"] },
    { id: "archive-annex", name: "Archive Annex", type: "library", sourceIds: ["nwn"] },
    { id: "neverwinter-academy", name: "Neverwinter Academy", type: "school", district: "Beggar's Nest", aliases: ["Adventurer's Academy"], description: "Academy teaching martial, arcane, divine, and roguish skills; it suffered a deadly attack during the Wailing Death crisis.", sourceIds: ["nwn"] },
    { id: "starshine-academy", name: "Starshine Academy", type: "school", sourceIds: ["nwn"] },
    { id: "scar-keep", name: "Scar Keep", type: "barracks", district: "The Chasm", factions: ["Scar Company"], description: "Warded Graycloak outpost later used by Scar Company to contain threats from the Chasm.", sourceIds: ["nw"] }
  ]
};
