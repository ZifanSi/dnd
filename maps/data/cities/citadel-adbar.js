export default {
  id: "citadel-adbar",
  name: "Citadel Adbar",
  region: "Silver Marches",
  sources: [
    { id: "sm", title: "Silver Marches", pages: "70", publisher: "Wizards of the Coast", year: 2002 },
    { id: "reader", title: "A Reader's Guide to R. A. Salvatore's The Legend of Drizzt", pages: "139", publisher: "Wizards of the Coast", year: 2008 },
    { id: "scag", title: "Sword Coast Adventurer's Guide", pages: "59", publisher: "Wizards of the Coast", year: 2015 }
  ],
  establishments: [
    { id: "foundry", name: "The Foundry", type: "blacksmith", description: "The citadel's central foundry, vented through the principal surface tower and supporting Adbar's metal, weapon, and armor exports.", sourceIds: ["reader", "sm"] },
    { id: "caravan-door", name: "Caravan Door", type: "gatehouse", description: "Heavy iron portal sealing the routes toward the Underdark, Fardrimm, and other Delzoun holds.", sourceIds: ["reader"] }
  ]
};
