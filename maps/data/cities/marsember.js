export default {
  id: "marsember",
  name: "Marsember",
  region: "Cormyr",
  sources: [
    { id: "vgc", title: "Volo's Guide to Cormyr", pages: "34-44", publisher: "TSR", year: 1995 },
    { id: "cormyr", title: "Cormyr", pages: "12-14", publisher: "TSR", year: 1993 }
  ],
  establishments: [
    { id: "barrelstone", name: "The Barrelstone Inn", type: "inn", sourceIds: ["cormyr"] },
    { id: "lily-pad", name: "Lily Pad Inn", type: "inn", sourceIds: ["vgc"] },
    { id: "cloven-shield", name: "The Cloven Shield", type: "tavern", sourceIds: ["cormyr"] },
    { id: "drowning-flagon", name: "The Drowning Flagon", type: "tavern", sourceIds: ["vgc"] },
    { id: "old-oak", name: "The Old Oak", type: "tavern", sourceIds: ["cormyr"] },
    { id: "roaring-griffon", name: "The Roaring Griffon", type: "tavern", sourceIds: ["cormyr"] },
    { id: "tankard-eels", name: "The Tankard of Eels", type: "tavern", sourceIds: ["vgc"] },
    { id: "felgontars-firehelm", name: "Felgontar's Firehelm", type: "blacksmith", sourceIds: ["vgc"] },
    { id: "morningmist-hall", name: "Morningmist Hall", type: "temple", deity: "Lathander", description: "The city's principal temple.", sourceIds: ["vgc", "cormyr"] },
    { id: "faircoins", name: "Faircoins Moneychanger", type: "temple", deity: "Waukeen", description: "Shrine to Waukeen combined with a moneychanging business.", sourceIds: ["vgc"] },
    { id: "house-cliff", name: "House on the Cliff", type: "temple", deity: "Umberlee", description: "Umberlant temple set apart from the main city.", sourceIds: ["vgc"] },
    { id: "kings-tower-town", name: "King's Tower", type: "town-hall", description: "Seat of Crown authority in Marsember.", sourceIds: ["vgc"] },
    { id: "faircoins-bank", name: "Faircoins Moneychanger", type: "bank", description: "Moneychanging establishment operated with Waukeen's shrine.", sourceIds: ["vgc"] },
    { id: "yi-woos-clinic", name: "Yi Woo's Clinic", type: "healer", district: "Xiousing", sourceIds: ["vgc"] },
    { id: "kings-tower-barracks", name: "King's Tower", type: "barracks", description: "Also housed the city's garrison.", sourceIds: ["vgc"] },
    { id: "starwater-keep", name: "Starwater Keep", type: "barracks", description: "Cormyrean naval base and drydock.", sourceIds: ["vgc"] },
    { id: "harbortower", name: "Harbortower", type: "guardhouse", description: "Defensive tower watching Marsember's harbor approaches.", sourceIds: ["vgc"] }
  ]
};
