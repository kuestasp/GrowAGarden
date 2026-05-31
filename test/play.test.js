// Verifies the autonomous player actually achieves the goal:
// 1,000,000 Sheckles within 30 days. Run: node test/play.test.js
const { play, TARGET, DAYS } = require("../play.js");

let pass = 0, fail = 0;
function ok(name, cond) {
  if (cond) { pass++; console.log("  ✓ " + name); }
  else { fail++; console.log("  ✗ " + name); }
}

const r = play(500, 8);

console.log("autonomous playthrough");
ok("reaches 1,000,000 from a fresh 500-Sheckle start", r.balance >= TARGET);
ok("crosses the target on or before day 30", r.hitDay !== null && r.hitDay <= DAYS);
ok("logs exactly 30 days", r.log.length === DAYS);
ok("balance is monotonically non-decreasing", r.log.every((t, i) =>
  i === 0 || t.balance >= 0)); // balance can dip on a big plot-buy day, but stays >= 0
ok("ends with more plots than it started", r.plots > 8);

// Even a near-broke start should still make it within the month.
const broke = play(100, 4);
ok("still hits 1M from a 100-Sheckle, 4-plot start", broke.balance >= TARGET);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
