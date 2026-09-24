export default {
  id: "citadel-felbarr",
  name: "Citadel Felbarr",
  region: "Silver Marches",
  sources: [
    { id: "skt", title: "Storm King's Thunder", pages: "78-79", publisher: "Wizards of the Coast", year: 2016 },
    { id: "companions", title: "The Companions", pages: "117, 191", publisher: "Wizards of the Coast", year: 2013 }
  ],
  establishments: [
    { id: "hall-of-ceremony", name: "Hall of Ceremony", type: "palace", description: "Part-carved high cavern containing a great hearth and the monarch's throne on a raised dais.", sourceIds: ["companions"] },
    { id: "north-vigil", name: "North Vigil", type: "guardhouse", description: "Fortified overlook armed with heavy catapults and ballistae on the approach to the Runegate.", sourceIds: ["skt"] },
    { id: "south-vigil", name: "South Vigil", type: "guardhouse", description: "Southern defensive overlook covering the Runegate approach.", sourceIds: ["skt"] },
    { id: "hammer", name: "The Hammer", type: "gatehouse", description: "Outer pair of forty-foot-high stone gates on the approach to the citadel.", sourceIds: ["skt"] },
    { id: "anvil", name: "The Anvil", type: "gatehouse", description: "Second gate complex, where the defended approach crosses the river.", sourceIds: ["skt"] },
    { id: "runegate", name: "The Runegate", type: "gatehouse", description: "Massive inner doors protected by thirty-two deadly runes, famed as a masterwork of the reclaimed citadel.", sourceIds: ["skt"] }
  ]
};
