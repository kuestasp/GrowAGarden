# 🌱 Grow a Garden — 1,000,000 in 30 Days

A planning toolkit for hitting **1,000,000 Sheckles in 30 days** in *Grow a Garden*.
It turns "make a million" from a vibe into a number you can check: pick a starting
point and a strategy, and the planner simulates your balance day by day.

> Numbers are community-sourced approximations and drift with game updates. Every
> value lives in `data/crops.js` and is editable. This is a planning aid, not a
> guarantee, and has no affiliation with the game or its developers.

## What's in here

| File | What it does |
|------|--------------|
| `index.html` | Interactive planner — open it in any browser, no build step, no install. |
| `plan.js` | Same engine as a terminal CLI. |
| `data/crops.js` | Editable crop + mutation dataset. |
| `data/engine.js` | The math: yields, rankings, the day-by-day simulator. |
| `test/engine.test.js` | Zero-dependency tests for the engine. |

## Use it

**Browser:** open `index.html` (double-click, or `python3 -m http.server` then visit
`localhost:8000`). Set your starting Sheckles, plots, crop, and mutation rate; the
verdict, chart, and tables update live.

**Terminal:**
```bash
node plan.js                                   # plan from a 500-Sheckle start
node plan.js --start 50000 --plots 12          # your actual situation
node plan.js --crop "Dragon Fruit" --mut 0.25  # focus a crop, 25% fruit mutated
node plan.js --growth Gold --env Frozen        # assume Gold + Frozen mutations
```

**Tests:**
```bash
node test/engine.test.js
```

## The strategy, in five moves

The million isn't won by clicking faster — it's won by bending your income curve
from **linear** (fixed plots) to **exponential** (reinvested plots × mutations).

1. **Climb the crop ladder by profit-per-plot-per-day, not by sell price.**
   A multi-harvest crop that regrows for days beats a flashy single-harvest one.
   The planner's "efficiency ranking" sorts by exactly this metric — chase the top
   of that list you can afford to fill *every* plot with.

2. **Fill every plot, always.** Idle dirt earns nothing. The simulator assumes a
   full garden; an empty plot is pure opportunity cost.

3. **Reinvest into plots early, bank late.** More plots multiply every future
   harvest, so early Sheckles are worth more spent on expansion than saved. The
   `reinvestRate` lever (70% by default) models this; the escalating plot cost
   stops it running away.

4. **Hunt mutations once volume is high.** Gold (×20), Rainbow (×50), and weather
   stacks (Frozen ×10, Shocked ×100, Disco ×125) multiply *base* sell value. A
   small fraction of mutated fruit can dwarf your ordinary income — set the
   "mutation %" slider to see the leverage. Sprinklers and weather events are how
   you raise that fraction.

5. **Let the numbers pick the crop.** Run the planner with *your* starting bank and
   plot count. The "cheapest crop that hits 1M in 30 days" table tells you the
   minimum seed capital and plots for each crop to clear the target at a constant
   rate — start with the cheapest one you can actually keep full, and ladder up.

### Worked example

Starting at 50,000 Sheckles with 12 plots, the solver shows the cheapest viable
paths and simulates your chosen crop's 30-day trajectory, flagging the exact day
you cross 1,000,000 (or how far short you land and what it'd take to close the
gap). Tune the inputs to your save and re-run.

## Keeping it current

The game rebalances often. When seed prices, sell values, or mutation multipliers
change, edit `data/crops.js` — the engine, CLI, and UI all read from it, and
`node test/engine.test.js` will confirm nothing broke.
