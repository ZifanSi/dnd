export default {
  id: "hlondeth",
  name: "Hlondeth",
  region: "Vilhon Reach",
  sources: [
    { id: "vr", title: "The Vilhon Reach — Dungeon Master's Reference", pages: "9-19", publisher: "TSR", year: 1996 },
    { id: "sk", title: "Serpent Kingdoms", pages: "92-95", publisher: "Wizards of the Coast", year: 2004 },
    { id: "vt", title: "Venom's Taste", publisher: "Wizards of the Coast", year: 2004 }
  ],
  establishments: [
    { id: "slithering-serpent", name: "Slithering Serpent Inn", type: "inn", description: "Popular visitor's inn noted for black adder stew.", sourceIds: ["vr"] },
    { id: "mortal-coil", name: "Mortal Coil", type: "tavern", district: "Waterfront", description: "Tavern in the cavernous basement of a waterfront warehouse.", sourceIds: ["vt"] },
    { id: "cathedral-emerald-scales", name: "Cathedral of Emerald Scales", type: "temple", district: "Behind the Amphisbaena Gate", deity: "Sseth as Varae", description: "Monumental former Extaminos residence and Ilmateri shrine converted into the city's central serpent cathedral.", sourceIds: ["sk"] },
    { id: "temple-helm", name: "Temple of Helm", type: "temple", deity: "Helm", sourceIds: ["vr"] },
    { id: "temple-silvanus", name: "Temple of Silvanus", type: "temple", deity: "Silvanus", sourceIds: ["vr"] },
    { id: "sacellum", name: "Sacellum of Slumbering Fire", type: "temple", district: "Base of Mount Ugruth", deity: "Talos", sourceIds: ["sk"] },
    { id: "scaled-halls", name: "Scaled Halls of Varae", type: "temple", district: "Catacombs beneath Hlondeth", deity: "Varae", description: "Ancient subterranean temple dating to −255 DR.", sourceIds: ["sk"] },
    { id: "amphisbaena-gate", name: "Amphisbaena Gate", type: "gatehouse", description: "Serpentine gate standing before the Cathedral of Emerald Scales.", sourceIds: ["sk"] }
  ]
};
