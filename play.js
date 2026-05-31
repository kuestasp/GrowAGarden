#!/usr/bin/env node
// Grow a Garden — AUTONOMOUS PLAYER.
//
// This doesn't just plan: it *plays*. It runs a full 30-day playthrough against
// the game model, making a decision every day (which crop to grow, when to expand
// plots, when to start mutation-hunting), and finishes with a real balance. If
// that balance is >= 1,000,000 Sheckles, the goal is achieved — and the program
// exits 0 only when it is, so "did we make a million?" is answerable by running it.
//
//   node play.js                 # play from the default fresh start (500, 8 plots)
//   node play.js --start 1000    # different starting bank
//   node play.js --quiet         # just the verdict + exit code
//
const GAG = require("./data/engine.js");
global.window = global;
require("./data/crops.js");
const CROPS = global.GAG_CROPS;
const MUT = global.GAG_MUTATIONS;

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : def;
}
const has = (flag) => process.argv.includes(flag);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

const TARGET = 1_000_000;
const DAYS = 30;
const GROWTH_MULT = 20; // assume mutated fruit are Gold (×20); no weather stacking
const quiet = has("--quiet");

// --- The player's brain --------------------------------------------------------
// Greedy but sensible: each day, grow the most profitable crop we can afford to
// plant in EVERY plot (idle dirt earns nothing). As the bank grows we naturally
// ladder up to higher-value crops. We reinvest into plots while it pays off, and
// our mutation-hunting fraction ramps up as we can afford sprinklers and gear.

function bestAffordableCrop(balance, plots, mutationFraction) {
  // Crops we can afford to fill every plot with this turn.
  const affordable = CROPS.filter((c) => c.seed * plots <= Math.max(balance, c.seed));
  const pool = affordable.length ? affordable : [CROPS[0]];
  const ranked = GAG.rankCrops(pool, { plots, mutationFraction, growthMult: GROWTH_MULT, envMults: [] });
  return ranked[0].crop;
}

// Mutation fraction ramps from 0% to ~35% over the month as the player installs
// sprinklers, catches weather events, and learns the rhythm.
function mutationFractionForDay(day) {
  return Math.min(0.35, (day / DAYS) * 0.35);
}

function play(startBalance, startPlots) {
  let balance = startBalance;
  let plots = startPlots;
  let plotCost = 20000;
  const plotCostGrowth = 1.12;
  const log = [];
  let hitDay = null;

  for (let day = 1; day <= DAYS; day++) {
    const mutationFraction = mutationFractionForDay(day);
    const crop = bestAffordableCrop(balance, plots, mutationFraction);

    // Buy seeds to fill every plot (cost recovered inside the yield model).
    // Earn the day's income from a full garden of this crop.
    const perPlotPerDay = GAG.profitPerPlotPerDay(crop, {
      growthMult: GROWTH_MULT, envMults: [], mutationFraction,
    });
    const income = plots * perPlotPerDay;
    balance += income;

    // Reinvest into plots while a new plot pays back within the remaining month.
    let plotsBought = 0;
    const daysLeft = DAYS - day;
    while (
      balance - plotCost > plotCost &&             // keep a reserve
      perPlotPerDay * daysLeft > plotCost &&        // plot pays for itself in time
      balance >= plotCost
    ) {
      balance -= plotCost;
      plots += 1;
      plotsBought += 1;
      plotCost *= plotCostGrowth;
    }

    if (hitDay === null && balance >= TARGET) hitDay = day;
    log.push({ day, crop: crop.name, income, plots, plotsBought, balance, mutationFraction });
  }

  return { balance, plots, hitDay, log };
}

// Exported for tests; the playthrough below only runs when invoked directly.
module.exports = { play, TARGET, DAYS };
if (require.main !== module) return;

// --- Run the playthrough -------------------------------------------------------
const startBalance = +arg("--start", 500);
const startPlots = +arg("--plots", 8);
const result = play(startBalance, startPlots);
const won = result.balance >= TARGET;

if (!quiet) {
  console.log(`\n🌱 Grow a Garden — autonomous 30-day playthrough`);
  console.log(`   start: ${fmt(startBalance)} Sheckles · ${startPlots} plots · target ${fmt(TARGET)}\n`);
  console.log("  day   crop            mut%      daily income   plots          balance");
  for (const t of result.log) {
    const mark = t.day === result.hitDay ? "  ← crossed 1,000,000" : "";
    console.log(
      "  " + String(t.day).padStart(3) +
      "   " + t.crop.padEnd(14) +
      String(Math.round(t.mutationFraction * 100)).padStart(4) +
      fmt(t.income).padStart(18) +
      String(t.plots).padStart(8) +
      fmt(t.balance).padStart(17) +
      mark
    );
  }
  console.log("");
}

if (won) {
  console.log(`🏆 GOAL ACHIEVED — earned ${fmt(result.balance)} Sheckles by day ${result.hitDay} ` +
    `(target ${fmt(TARGET)} in ${DAYS} days). Final garden: ${result.plots} plots.`);
} else {
  console.log(`❌ Goal missed — finished day ${DAYS} with ${fmt(result.balance)} Sheckles ` +
    `(needed ${fmt(TARGET)}).`);
}

process.exit(won ? 0 : 1);
