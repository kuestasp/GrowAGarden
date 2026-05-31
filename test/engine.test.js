// Minimal zero-dependency test runner for the planning engine.
// Run: node test/engine.test.js
const GAG = require("../data/engine.js");

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name); }
}
function approx(a, b, eps = 1e-6) { return Math.abs(a - b) <= eps * Math.max(1, Math.abs(b)); }

// A simple, single-harvest crop: 1-day lifecycle, +90 profit/plant.
const simple = { name: "Test", seed: 10, sell: 100, growHrs: 24, harvests: 1, reHrs: 0 };

console.log("fruitValue / mutations");
ok("base value with no mutation", GAG.fruitValue(100) === 100);
ok("gold ×20", GAG.fruitValue(100, 20) === 2000);
ok("gold ×20 then wet ×2 stacks", GAG.fruitValue(100, 20, [2]) === 4000);

console.log("lifecycle");
ok("single-harvest lifecycle = growHrs", GAG.lifecycleHours(simple) === 24);
ok("multi-harvest adds regrow time",
  GAG.lifecycleHours({ growHrs: 10, harvests: 3, reHrs: 2 }) === 14);

console.log("profitPerPlotPerDay");
// 1-day lifecycle, revenue 100, seed 10 -> 90/day.
ok("simple crop nets sell-minus-seed per day",
  approx(GAG.profitPerPlotPerDay(simple), 90));
// Mutation fraction blends value: 50% gold (×20=2000) + 50% base (100) = 1050 rev, -10 seed.
ok("mutationFraction blends mutated and base value",
  approx(GAG.profitPerPlotPerDay(simple, { growthMult: 20, mutationFraction: 0.5 }), 1040));

console.log("daysAtConstantRate");
ok("0/day never reaches target", GAG.daysAtConstantRate(0, 0, 1e6) === Infinity);
ok("100/day reaches 1000 from 0 in 10 days",
  approx(GAG.daysAtConstantRate(0, 100, 1000), 10));

console.log("solveForTarget");
const solved = GAG.solveForTarget([simple], { days: 30, target: 1_000_000, startBalance: 0 });
// 90/plot/day * 30 days = 2700/plot -> ceil(1e6/2700) = 371 plots.
ok("plots needed computed correctly", solved[0].plotsNeeded === Math.ceil(1e6 / 2700));
ok("seed capital = plots * seed", solved[0].seedCapital === Math.ceil(1e6 / 2700) * 10);

console.log("simulate");
// No expansion, 100 plots of simple crop: 9000/day -> day-30 balance 270000, never hits 1M.
const noExpand = GAG.simulate({
  startBalance: 0, plots: 100, crop: simple, plotCost: 0,
  reinvestPlots: false, days: 30, target: 1_000_000,
});
ok("flat income, no expansion: linear balance", noExpand.finalBalance === 270000);
ok("flat income misses 1M target", noExpand.success === false);

// Enough plots to succeed: 400 plots * 90 = 36000/day -> crosses 1M before day 30.
const succeed = GAG.simulate({
  startBalance: 0, plots: 400, crop: simple, plotCost: 0,
  reinvestPlots: false, days: 30, target: 1_000_000,
});
ok("400 plots reaches 1M", succeed.success === true);
ok("hit day is when cumulative crosses target",
  succeed.hitDay === Math.ceil(1_000_000 / (400 * 90)));

// Reinvestment grows plot count over time.
const reinvest = GAG.simulate({
  startBalance: 100000, plots: 8, crop: simple, plotCost: 1000,
  plotCostGrowth: 1.0, reinvestPlots: true, days: 30, target: 1_000_000,
});
ok("reinvestment increases plot count", reinvest.finalPlots > 8);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
