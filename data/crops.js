// Grow a Garden — crop dataset
// Values are community-sourced approximations and WILL drift as the game updates.
// Every number here is editable in the planner UI; treat these as sane defaults.
//
// Fields:
//   seed      - Sheckles to buy one seed from the shop
//   sell      - base Sheckles per harvested fruit (no mutation, average size)
//   growHrs   - hours from planting until first harvest
//   harvests  - how many times a single plant can be harvested
//                 (1 = single-harvest, >1 = multi-harvest / regrowing)
//   reHrs     - hours between regrowth harvests for multi-harvest crops
//   tier      - rough shop availability tier (for grouping in the UI)
window.GAG_CROPS = [
  // name,           seed,    sell,   growHrs, harvests, reHrs, tier
  { name: "Carrot",        seed: 10,     sell: 22,     growHrs: 0.5,  harvests: 1,   reHrs: 0,    tier: "starter" },
  { name: "Strawberry",    seed: 50,     sell: 19,     growHrs: 1,    harvests: 12,  reHrs: 0.4,  tier: "starter" },
  { name: "Blueberry",     seed: 400,    sell: 21,     growHrs: 1.5,  harvests: 18,  reHrs: 0.4,  tier: "starter" },
  { name: "Tomato",        seed: 800,    sell: 35,     growHrs: 2,    harvests: 20,  reHrs: 0.5,  tier: "common" },
  { name: "Corn",          seed: 1300,   sell: 44,     growHrs: 2,    harvests: 15,  reHrs: 0.6,  tier: "common" },
  { name: "Watermelon",    seed: 2500,   sell: 2905,   growHrs: 6,    harvests: 1,   reHrs: 0,    tier: "rare" },
  { name: "Pumpkin",       seed: 3000,   sell: 3854,   growHrs: 7,    harvests: 1,   reHrs: 0,    tier: "rare" },
  { name: "Apple",         seed: 3250,   sell: 266,    growHrs: 4,    harvests: 20,  reHrs: 0.7,  tier: "rare" },
  { name: "Bamboo",        seed: 4000,   sell: 3944,   growHrs: 1,    harvests: 1,   reHrs: 0,    tier: "rare" },
  { name: "Coconut",       seed: 6000,   sell: 361,    growHrs: 6,    harvests: 22,  reHrs: 0.9,  tier: "legendary" },
  { name: "Cactus",        seed: 15000,  sell: 3068,   growHrs: 5,    harvests: 18,  reHrs: 0.8,  tier: "legendary" },
  { name: "Dragon Fruit",  seed: 50000,  sell: 4287,   growHrs: 8,    harvests: 20,  reHrs: 1.0,  tier: "legendary" },
  { name: "Mango",         seed: 100000, sell: 5866,   growHrs: 10,   harvests: 20,  reHrs: 1.2,  tier: "mythical" },
  { name: "Grape",         seed: 850000, sell: 7085,   growHrs: 12,   harvests: 24,  reHrs: 1.2,  tier: "mythical" },
  { name: "Mushroom",      seed: 130000, sell: 136278, growHrs: 18,   harvests: 1,   reHrs: 0,    tier: "mythical" },
  { name: "Pepper",        seed: 1000000,sell: 7220,   growHrs: 14,   harvests: 24,  reHrs: 1.3,  tier: "divine" },
  { name: "Cacao",         seed: 2500000,sell: 10456,  growHrs: 16,   harvests: 24,  reHrs: 1.4,  tier: "divine" },
  { name: "Beanstalk",     seed: 10000000,sell: 25270, growHrs: 20,   harvests: 26,  reHrs: 1.5,  tier: "prismatic" },
];

// Mutation multipliers stack multiplicatively on the base sell value.
// Growth mutation (Gold/Rainbow) picks ONE; environmental mutations stack.
window.GAG_MUTATIONS = {
  growth: [
    { name: "None",    mult: 1 },
    { name: "Gold",    mult: 20 },
    { name: "Rainbow", mult: 50 },
  ],
  environmental: [
    { name: "Wet",        mult: 2 },
    { name: "Chilled",    mult: 2 },
    { name: "Choc",       mult: 2 },
    { name: "Moonlit",    mult: 2 },
    { name: "Bloodlit",   mult: 4 },
    { name: "Frozen",     mult: 10 },
    { name: "Shocked",    mult: 100 },
    { name: "Celestial",  mult: 120 },
    { name: "Disco",      mult: 125 },
  ],
};
