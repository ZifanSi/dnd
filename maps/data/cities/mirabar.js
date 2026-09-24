export default {
  id: "mirabar",
  name: "Mirabar",
  region: "Sword Coast North",
  sources: [
    { id: "vgn", title: "Volo's Guide to the North", pages: "151-159", publisher: "TSR", year: 1993 },
    { id: "north", title: "The North: Guide to the Savage Frontier — Cities & Civilization", pages: "25-27", publisher: "TSR", year: 1996 },
    { id: "ghost-king", title: "The Ghost King", publisher: "Wizards of the Coast", year: 2009 }
  ],
  establishments: [
    { id: "house-bright-blade", name: "House of the Bright Blade", type: "blacksmith", description: "Zespara Alather's celebrated sword shop and smithy, renowned for blades that seemed custom-made for their wielders.", sourceIds: ["vgn"] },
    { id: "hall-all-fires-town", name: "Hall of All Fires", type: "town-hall", district: "Undercity", description: "Furnace-lined great hall used for Mirabar's largest public gatherings, with room for more than two thousand.", sourceIds: ["vgn"] },
    { id: "barkskins-storehouse", name: "Barkskin's Storehouse", type: "warehouse", district: "Undercity", description: "Secret marketplace and storehouse in the dwarven section of the Undercity.", sourceIds: ["ghost-king"] }
  ]
};
