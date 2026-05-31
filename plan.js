#!/usr/bin/env node
// Grow a Garden — 1,000,000-in-30-days planner (CLI).
// Usage:
//   node plan.js                         # best plan from a 500-Sheckle start
//   node plan.js --start 50000 --plots 12 --crop "Dragon Fruit"
//   node plan.js --mut 0.25 --growth Gold --env Frozen
//
const GAG = require("./data/engine.js");
// crops.js attaches to window/globalThis; emulate a browser-ish global.
global.window = global;
require("./data/crops.js");
const CROPS = global.GAG_CROPS;
const MUT = global.GAG_MUTATIONS;

function arg(flag, def) {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : def;
}
const fmt = (n) => Math.round(n).toLocaleString("en-US");

const TARGET = 1_000_000, DAYS = 30;
const startBalance = +arg("--start", 500);
const plots = +arg("--plots", 8);
const mutationFraction = +arg("--mut", 0.1);
const plotCost = +arg("--plotcost", 20000);
const growthName = arg("--growth", "None");
const envName = arg("--env", "None");
const cropName = arg("--crop", null);

const growthMult = (MUT.growth.find((m) => m.name === growthName) || { mult: 1 }).mult;
const envMatch = MUT.environmental.find((m) => m.name === envName);
const envMults = envMatch ? [envMatch.mult] : [];

const baseOpts = { growthMult, envMults, mutationFraction, target: TARGET, days: DAYS, startBalance };

console.log(`\n🌱 Grow a Garden — target ${fmt(TARGET)} Sheckles in ${DAYS} days`);
console.log(`   start ${fmt(startBalance)} · ${plots} plots · ${Math.round(mutationFraction * 100)}% mutated` +
  ` · growth ${growthName} · weather ${envName}\n`);

// --- Cheapest viable crop -----------------------------------------------------
const solved = GAG.solveForTarget(CROPS, baseOpts).slice(0, 6);
console.log("Cheapest crops that reach 1M in 30 days (kept full):");
console.log("  crop                profit/plot/day   plots   seed capital");
for (const r of solved) {
  console.log(
    "  " + r.crop.name.padEnd(18) +
    fmt(r.perPlotPerDay).padStart(12) +
    String(r.plotsNeeded).padStart(9) +
    fmt(r.seedCapital).padStart(16)
  );
}

// --- Simulate the chosen (or recommended) crop --------------------------------
const crop = cropName
  ? CROPS.find((c) => c.name.toLowerCase() === cropName.toLowerCase())
  : (solved[0] && solved[0].crop) || CROPS[0];

if (!crop) { console.error("Unknown crop."); process.exit(1); }

const sim = GAG.simulate({ ...baseOpts, plots, plotCost, reinvestPlots: true, crop });

console.log(`\nSimulating: ${crop.name} (${fmt(crop.seed)} seed, ${fmt(crop.sell)}/fruit)\n`);
if (sim.success) {
  console.log(`✅ Hit 1,000,000 on day ${sim.hitDay}. Day-30 balance: ${fmt(sim.finalBalance)} · ${sim.finalPlots} plots.`);
} else {
  console.log(`❌ Short of target — day-30 balance ${fmt(sim.finalBalance)} with ${sim.finalPlots} plots.`);
}

console.log("\n  day   daily income   plots   balance");
for (const t of sim.trajectory) {
  if (t.day % 3 === 0 || t.day === 1 || t.day === sim.hitDay) {
    console.log(
      "  " + String(t.day).padStart(3) +
      fmt(t.income).padStart(15) +
      String(t.plots).padStart(8) +
      fmt(t.balance).padStart(12) +
      (t.day === sim.hitDay ? "  ← 1M" : "")
    );
  }
}
console.log("");
