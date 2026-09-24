export default {
  id: "candlekeep",
  name: "Candlekeep",
  region: "Sword Coast",
  sources: [
    { id: "cm", title: "Candlekeep Mysteries", pages: "6-17", publisher: "Wizards of the Coast", year: 2021 },
    { id: "scag", title: "Sword Coast Adventurer's Guide", pages: "74-77", publisher: "Wizards of the Coast", year: 2015 }
  ],
  establishments: [
    { id: "house-of-rest", name: "House of Rest", type: "inn", district: "Court of Air", description: "Simple three-story bunkhouse providing lodging to visiting Seekers.", sourceIds: ["cm"] },
    { id: "hearth", name: "The Hearth", type: "tavern", district: "Court of Air", description: "Always-open dining and meeting hall with shrines to Deneir, Gond, and Milil.", sourceIds: ["cm"] },
    { id: "temple-oghma", name: "Temple of Oghma", type: "temple", district: "Court of Air", deity: "Oghma", sourceIds: ["cm"] },
    { id: "smithy-stables-smith", name: "Smithy & Stables", type: "blacksmith", district: "Court of Air", description: "Khe'ril Hammerbind's combined smithy and mount-care establishment.", sourceIds: ["cm"] },
    { id: "smithy-stables-stable", name: "Smithy & Stables", type: "stable", district: "Court of Air", description: "Provides stabling even for unusual flying mounts.", sourceIds: ["cm"] },
    { id: "great-library", name: "Great Library of Candlekeep", type: "library", district: "Inner Ward", description: "The fortress's vast central repository of written knowledge.", sourceIds: ["cm", "scag"] },
    { id: "pillars-pedagogy", name: "Pillars of Pedagogy", type: "school", district: "Court of Air", description: "Cluster of towers where the Avowed research questions submitted by Seekers.", sourceIds: ["cm"] },
    { id: "baths", name: "The Baths", type: "bathhouse", district: "Court of Air", description: "Public bathhouse for Seekers supplied by volcanically heated water pumps.", sourceIds: ["cm"] },
    { id: "warmwet", name: "The Warmwet", type: "bathhouse", district: "Beneath Candlekeep", description: "Volcanically heated bathhouse reserved for the Avowed.", sourceIds: ["cm"] },
    { id: "emerald-door", name: "Emerald Door", type: "gatehouse", district: "Between the Court of Air and Inner Ward", description: "Guarded inner portal through which only the Avowed normally pass.", sourceIds: ["cm"] }
  ]
};
