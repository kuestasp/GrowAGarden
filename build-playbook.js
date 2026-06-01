#!/usr/bin/env node
// Generates PLAYBOOK.md — a concrete, human-executable 30-day plan derived from
// the verified playthrough in play.js. This is the artifact a real player follows
// in the live game to actually earn the million; the simulator proves the route,
// this turns it into daily actions.
const fs = require("fs");
const path = require("path");
const { play, TARGET, DAYS } = require("./play.js");
global.window = global; require("./data/crops.js");
const CROPS = global.GAG_CROPS;
const cropByName = (n) => CROPS.find((c) => c.name === n);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

const r = play(500, 8);

// Collapse the daily log into phases (consecutive days on the same crop), so the
// player reads "do this until your bank hits X" instead of 30 near-identical rows.
const phases = [];
for (const t of r.log) {
  const last = phases[phases.length - 1];
  if (last && last.crop === t.crop) {
    last.endDay = t.day; last.endPlots = t.plots; last.endBal = t.balance;
  } else {
    phases.push({ crop: t.crop, startDay: t.day, endDay: t.day,
      startPlots: t.plots, endPlots: t.plots, endBal: t.balance });
  }
}

const lines = [];
const W = (s) => lines.push(s);

W("# 🌱 The 30-Day Million Playbook");
W("");
W("> A concrete, day-by-day plan for earning **1,000,000 Sheckles in 30 days** in");
W("> *Grow a Garden*. This is the human-executable version of the strategy that");
W("> `play.js` verifies: follow it in the live game and you run the same route the");
W(`> simulator clears the target on **day ${r.hitDay}** with.`);
W("");
W("_Auto-generated from the verified playthrough by `node build-playbook.js`. Crop");
W("values are approximations — re-run after editing `data/crops.js` to refresh._");
W("");
W("## The whole plan at a glance");
W("");
W("| Phase | Days | Grow | Goal of the phase |");
W("|-------|------|------|-------------------|");
const phaseGoal = [
  "Build your first real bank from a cheap, fast, regrowing crop.",
  "Cash a high-value single-harvest crop to fund your first plot expansion.",
  "Scale plots hard — every Sheckle of profit becomes more plots.",
  "Switch to a top-tier multi-harvest crop and let volume compound.",
  "Ride the highest-value crop to the million and beyond.",
];
phases.forEach((p, i) => {
  const days = p.startDay === p.endDay ? `${p.startDay}` : `${p.startDay}–${p.endDay}`;
  W(`| ${i + 1} | ${days} | **${p.crop}** | ${phaseGoal[i] || "Compound."} |`);
});
W("");

W("## Daily routine (do this every login, every phase)");
W("");
W("1. **Harvest everything ready.** Idle ripe fruit isn't earning multipliers.");
W("2. **Replant every empty plot immediately** with the phase's crop. Empty dirt = lost money.");
W("3. **Sell** unless you're holding for a mutation (see below).");
W("4. **Spend surplus on the next plot** until a plot can't pay for itself before day 30.");
W("5. **Keep sprinklers running** and stay online during weather events to raise your mutation rate.");
W("");

W("## Phase-by-phase");
W("");
phases.forEach((p, i) => {
  const c = cropByName(p.crop);
  const dayLabel = p.endDay !== p.startDay ? `days ${p.startDay}–${p.endDay}` : `day ${p.startDay}`;
  W(`### Phase ${i + 1} — ${p.crop}  (${dayLabel})`);
  W("");
  W(`- **Plant:** ${p.crop} — ${fmt(c.seed)} Sheckles/seed, sells ~${fmt(c.sell)}/fruit` +
    `${c.harvests > 1 ? `, regrows ${c.harvests}× (multi-harvest — keep it, don't replant early)` : " (single-harvest)"}.`);
  W(`- **Why now:** ${phaseGoal[i] || "Best profit-per-plot you can fully afford at this bankroll."}`);
  W(`- **Plots:** start ~${p.startPlots}, push toward ~${p.endPlots} by reinvesting profit.`);
  W(`- **Exit when:** your bank clears **${fmt(p.endBal)}** — then move to ${phases[i + 1] ? "Phase " + (i + 2) + " (" + phases[i + 1].crop + ")" : "banking the win"}.`);
  W("");
});

W("## Mutation hunting (the real accelerant)");
W("");
W("Mutations multiply a fruit's *base* sell value and stack:");
W("");
W("- **Gold ×20**, **Rainbow ×50** — pick one growth mutation per fruit.");
W("- Weather/event stacks: **Wet ×2**, **Frozen ×10**, **Shocked ×100**, **Disco ×125**, and more.");
W("");
W("From mid-game on, **hold high-tier mutated fruit** instead of selling immediately —");
W("a single Rainbow + Frozen high-tier fruit can outsell a whole ordinary harvest.");
W("Sprinklers and being online for weather events are how you raise your mutated %.");
W("");

W("## Checkpoints — are you on pace?");
W("");
W("| By end of day | You should have at least |");
W("|---------------|--------------------------|");
[3, 5, 7, 10, 15, 30].forEach((d) => {
  const row = r.log[d - 1];
  if (row) W(`| ${d} | ${fmt(row.balance)} Sheckles, ~${row.plots} plots |`);
});
W("");
W(`If you're behind a checkpoint: you're under-expanded or under-mutating. Buy more`);
W(`plots and keep them **all** full, and prioritize weather events for mutations.`);
W("");
W("## Verify the route");
W("");
W("```bash");
W("node play.js     # replays the full strategy; prints the day it crosses 1,000,000");
W("npm test         # confirms the engine + playthrough still reach the target");
W("```");
W("");
W(`Verified result: **${fmt(r.balance)} Sheckles by day ${DAYS}** (crossed ${fmt(TARGET)} on day ${r.hitDay}).`);
W("");

fs.writeFileSync(path.join(__dirname, "PLAYBOOK.md"), lines.join("\n"));
console.log(`Wrote PLAYBOOK.md — ${phases.length} phases, crosses 1M on day ${r.hitDay}.`);
