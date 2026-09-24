export default {
  id: "sundabar",
  name: "Sundabar",
  region: "Silver Marches",
  era: "The listed establishments describe Sundabar before its sack during the War of the Silver Marches.",
  sources: [
    { id: "sm", title: "Silver Marches", pages: "65-69", publisher: "Wizards of the Coast", year: 2002 },
    { id: "vgn", title: "Volo's Guide to the North", pages: "181-187", publisher: "TSR", year: 1993 }
  ],
  establishments: [
    { id: "baldivers", name: "Baldiver's", type: "inn", description: "Quiet, spacious, castle-like inn catering to an older clientele.", sourceIds: ["vgn"] },
    { id: "firestar-chariot", name: "Firestar Chariot", type: "inn", description: "Lively inn popular with younger patrons.", sourceIds: ["sm", "vgn"] },
    { id: "malshyms-house", name: "Malshym's House", type: "inn", description: "Clean, quiet inn favored by traveling merchants.", sourceIds: ["sm"] },
    { id: "trumpet", name: "The Trumpet", type: "inn", description: "Luxurious, discreet inn used by several adventuring companies.", sourceIds: ["sm", "vgn"] },
    { id: "lusty-wench", name: "Lusty Wench", type: "inn", description: "Inn near a warehouse that had once housed the Anstruth bardic college.", sourceIds: ["vgn"] },
    { id: "halabars-horn", name: "Halabar's Horn of Spirits", type: "tavern", district: "Lanthalar Street", description: "Notorious rough drinking house.", sourceIds: ["vgn"] },
    { id: "sighing-sylph", name: "Sighing Sylph", type: "tavern", district: "Northwind Street", description: "Quiet neighborhood tavern.", sourceIds: ["vgn"] },
    { id: "tabbard-tankard", name: "Tabbard & Tankard", type: "tavern", sourceIds: ["vgn"] },
    { id: "unshimbles-ugly-face", name: "Unshimble's Ugly Face", type: "tavern", description: "Rowdy tavern marked by an enormous goblin-head sign.", sourceIds: ["vgn"] },
    { id: "old-anvil-smithy", name: "Old Anvil Smithy", type: "blacksmith", sourceIds: ["sm"] },
    { id: "everlasting-justice", name: "Hall of Everlasting Justice", type: "temple", deities: ["Tyr", "Torm"], sourceIds: ["sm"] },
    { id: "hall-vigilance", name: "Hall of Vigilance", type: "temple", district: "Near Eastgate", deity: "Helm", sourceIds: ["sm"] },
    { id: "masters-hall", name: "Master's Hall", type: "town-hall", district: "The Circle", description: "Central group of towers and battlements housing the city government.", sourceIds: ["sm"] },
    { id: "swordsgate", name: "Swordsgate", type: "gatehouse", description: "Northern gate and bridge through Sundabar's double walls.", sourceIds: ["sm"] },
    { id: "eastgate", name: "Eastgate", type: "gatehouse", sourceIds: ["sm"] },
    { id: "turnstone-gate", name: "Turnstone Gate", type: "gatehouse", sourceIds: ["sm"] },
    { id: "rivergate", name: "Rivergate", type: "gatehouse", sourceIds: ["sm"] }
  ]
};
