import { InventoryItemName } from "./game";

export const KNOWN_IDS: Record<InventoryItemName, number> = {
  "Sunflower Seed": 101,
  "Potato Seed": 102,
  "Pumpkin Seed": 103,
  "Carrot Seed": 104,
  "Cabbage Seed": 105,
  "Beetroot Seed": 106,
  "Cauliflower Seed": 107,
  "Parsnip Seed": 108,
  "Radish Seed": 109,
  "Wheat Seed": 110,

  Sunflower: 201,
  Potato: 202,
  Pumpkin: 203,
  Carrot: 204,
  Cabbage: 205,
  Beetroot: 206,
  Cauliflower: 207,
  Parsnip: 208,
  Radish: 209,
  Wheat: 210,

  Axe: 301,
  Pickaxe: 302,
  "Stone Pickaxe": 303,
  "Iron Pickaxe": 304,
  Hammer: 305,
  Rod: 306,

  "Sunflower Statue": 401,
  "Potato Statue": 402,
  "Christmas Tree": 403,
  Scarecrow: 404,
  "Farm Cat": 405,
  "Farm Dog": 406,
  Gnome: 407,
  "Chicken Coop": 408,
  "Gold Egg": 409,
  "Golden Cauliflower": 410,
  "Sunflower Tombstone": 411,
  "Sunflower Rock": 412,
  "Goblin Crown": 413,
  Fountain: 414,
  "Woody the Beaver": 415,
  "Apprentice Beaver": 416,
  "Foreman Beaver": 417,
  "Mysterious Parsnip": 418,
  "Carrot Sword": 419,

  "Pumpkin Soup": 501,
  "Roasted Cauliflower": 502,
  Sauerkraut: 503,

  Wood: 601,
  Stone: 602,
  Iron: 603,
  Gold: 604,
  Egg: 605,
  Chicken: 606,
  Cow: 607,
  Pig: 608,
  Sheep: 609,

  "Green Thumb": 701,
  "Barn Manager": 702,
  "Seed Specialist": 703,
  Wrangler: 704,
  Lumberjack: 705,
  Prospector: 706,
  Logger: 707,
  "Gold Rush": 708,

  "Australian Flag": 801,
  "Belgian Flag": 802,
  "Brazilian Flag": 803,
  "Chinese Flag": 804,
  "Finnish Flag": 805,
  "French Flag": 806,
  "German Flag": 807,
  "Indonesian Flag": 808,
  "Indian Flag": 809,
  "Iranian Flag": 810,
  "Italian Flag": 811,
  "Japanese Flag": 812,
  "Moroccan Flag": 813,
  "Dutch Flag": 814,
  "Philippine Flag": 815,
  "Polish Flag": 816,
  "Portuguese Flag": 817,
  "Russian Flag": 818,
  "Saudi Arabian Flag": 819,
  "South Korean Flag": 820,
  "Spanish Flag": 821,
  "Sunflower Flag": 822,
  "Thai Flag": 823,
  "Turkish Flag": 824,
  "Ukrainian Flag": 825,
  "American Flag": 826,
  "Vietnamese Flag": 827,
  "Canadian Flag": 828,
  "Singaporean Flag": 829,
  "British Flag": 830,
  "Sierra Leone Flag": 831,
  "Romanian Flag": 832,
  "Rainbow Flag": 833,
  "Goblin Flag": 834,
  "Pirate Flag": 835,
  "Algerian Flag": 836,
  "Mexican Flag": 837,
  "Dominican Republic Flag": 838,
  "Argentinian Flag": 839,
  "Lithuanian Flag": 840,
  "Malaysian Flag": 841,
  "Colombian Flag": 842,
};

// The reverse of above
export const KNOWN_ITEMS: Record<string, InventoryItemName> = Object.assign(
  {},
  ...Object.entries(KNOWN_IDS).map(([a, b]) => ({ [b]: a }))
);

export const IDS = Object.values(KNOWN_IDS);
