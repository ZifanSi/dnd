export default {
  id: "menzoberranzan",
  name: "Menzoberranzan",
  region: "Northdark",
  sources: [
    { id: "mcoi", title: "Menzoberranzan: City of Intrigue", pages: "29-83", publisher: "Wizards of the Coast", year: 2012 },
    { id: "menzo", title: "Menzoberranzan (boxed set)", publisher: "TSR", year: 1992 },
    { id: "dotu", title: "Drizzt Do'Urden's Guide to the Underdark", pages: "70-79", publisher: "Wizards of the Coast", year: 1999 }
  ],
  establishments: [
    { id: "narbondels-shadow", name: "Narbondel's Shadow", type: "inn", district: "Eastmyr", description: "Good, inexpensive inn run in 1370 DR by the stranded human adventurer Nicholas Tindall.", sourceIds: ["dotu"] },
    { id: "symeeras", name: "Symeera's", type: "inn", district: "Eastmyr", description: "Fine inn operated by Symeera of Neverwinter.", sourceIds: ["dotu"] },
    { id: "carpathians-tavern", name: "Carpathian's Tavern", type: "tavern", sourceIds: ["menzo"] },
    { id: "gollvelius-tavern", name: "Gollvelius' Tavern", type: "tavern", sourceIds: ["menzo"] },
    { id: "oozing-myconid", name: "Oozing Myconid", type: "tavern", district: "Braeryn", sourceIds: ["mcoi"] },
    { id: "arach-tinilith-temple", name: "Arach-Tinilith", type: "temple", district: "Tier Breche", deity: "Lolth", description: "Temple-academy that standardized the training of Lolth's priestesses.", sourceIds: ["menzo", "mcoi"] },
    { id: "arach-tinilith-school", name: "Arach-Tinilith", type: "school", district: "Tier Breche", description: "One of the city's three great academies, reserved for the education of priestesses.", sourceIds: ["menzo", "mcoi"] },
    { id: "melee-magthere", name: "Melee-Magthere", type: "school", district: "Tier Breche", description: "Martial academy of Menzoberranzan.", sourceIds: ["menzo", "mcoi"] },
    { id: "sorcere", name: "Sorcere", type: "school", district: "Tier Breche", description: "Arcane academy and tower of the city's wizards.", sourceIds: ["menzo", "mcoi"] },
    { id: "fane-quarvelsharess", name: "Fane of Quarvelsharess", type: "temple", deity: "Lolth", sourceIds: ["mcoi"] }
  ]
};
