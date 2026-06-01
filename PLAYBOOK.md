# 🌱 The 30-Day Million Playbook

> A concrete, day-by-day plan for earning **1,000,000 Sheckles in 30 days** in
> *Grow a Garden*. This is the human-executable version of the strategy that
> `play.js` verifies: follow it in the live game and you run the same route the
> simulator clears the target on **day 7** with.

_Auto-generated from the verified playthrough by `node build-playbook.js`. Crop
values are approximations — re-run after editing `data/crops.js` to refresh._

## The whole plan at a glance

| Phase | Days | Grow | Goal of the phase |
|-------|------|------|-------------------|
| 1 | 1–3 | **Strawberry** | Build your first real bank from a cheap, fast, regrowing crop. |
| 2 | 4 | **Pumpkin** | Cash a high-value single-harvest crop to fund your first plot expansion. |
| 3 | 5–6 | **Bamboo** | Scale plots hard — every Sheckle of profit becomes more plots. |
| 4 | 7–10 | **Cactus** | Switch to a top-tier multi-harvest crop and let volume compound. |
| 5 | 11 | **Bamboo** | Ride the highest-value crop to the million and beyond. |
| 6 | 12–30 | **Mushroom** | Compound. |

## Daily routine (do this every login, every phase)

1. **Harvest everything ready.** Idle ripe fruit isn't earning multipliers.
2. **Replant every empty plot immediately** with the phase's crop. Empty dirt = lost money.
3. **Sell** unless you're holding for a mutation (see below).
4. **Spend surplus on the next plot** until a plot can't pay for itself before day 30.
5. **Keep sprinklers running** and stay online during weather events to raise your mutation rate.

## Phase-by-phase

### Phase 1 — Strawberry  (days 1–3)

- **Plant:** Strawberry — 50 Sheckles/seed, sells ~19/fruit, regrows 12× (multi-harvest — keep it, don't replant early).
- **Why now:** Build your first real bank from a cheap, fast, regrowing crop.
- **Plots:** start ~8, push toward ~8 by reinvesting profit.
- **Exit when:** your bank clears **30,269** — then move to Phase 2 (Pumpkin).

### Phase 2 — Pumpkin  (day 4)

- **Plant:** Pumpkin — 3,000 Sheckles/seed, sells ~3,854/fruit (single-harvest).
- **Why now:** Cash a high-value single-harvest crop to fund your first plot expansion.
- **Plots:** start ~12, push toward ~12 by reinvesting profit.
- **Exit when:** your bank clears **51,835** — then move to Phase 3 (Bamboo).

### Phase 3 — Bamboo  (days 5–6)

- **Plant:** Bamboo — 4,000 Sheckles/seed, sells ~3,944/fruit (single-harvest).
- **Why now:** Scale plots hard — every Sheckle of profit becomes more plots.
- **Plots:** start ~26, push toward ~36 by reinvesting profit.
- **Exit when:** your bank clears **814,501** — then move to Phase 4 (Cactus).

### Phase 4 — Cactus  (days 7–10)

- **Plant:** Cactus — 15,000 Sheckles/seed, sells ~3,068/fruit, regrows 18× (multi-harvest — keep it, don't replant early).
- **Why now:** Switch to a top-tier multi-harvest crop and let volume compound.
- **Plots:** start ~43, push toward ~55 by reinvesting profit.
- **Exit when:** your bank clears **4,252,300** — then move to Phase 5 (Bamboo).

### Phase 5 — Bamboo  (day 11)

- **Plant:** Bamboo — 4,000 Sheckles/seed, sells ~3,944/fruit (single-harvest).
- **Why now:** Ride the highest-value crop to the million and beyond.
- **Plots:** start ~56, push toward ~56 by reinvesting profit.
- **Exit when:** your bank clears **12,758,417** — then move to Phase 6 (Mushroom).

### Phase 6 — Mushroom  (days 12–30)

- **Plant:** Mushroom — 130,000 Sheckles/seed, sells ~136,278/fruit (single-harvest).
- **Why now:** Best profit-per-plot you can fully afford at this bankroll.
- **Plots:** start ~61, push toward ~63 by reinvesting profit.
- **Exit when:** your bank clears **983,672,704** — then move to banking the win.

## Mutation hunting (the real accelerant)

Mutations multiply a fruit's *base* sell value and stack:

- **Gold ×20**, **Rainbow ×50** — pick one growth mutation per fruit.
- Weather/event stacks: **Wet ×2**, **Frozen ×10**, **Shocked ×100**, **Disco ×125**, and more.

From mid-game on, **hold high-tier mutated fruit** instead of selling immediately —
a single Rainbow + Frozen high-tier fruit can outsell a whole ordinary harvest.
Sprinklers and being online for weather events are how you raise your mutated %.

## Checkpoints — are you on pace?

| By end of day | You should have at least |
|---------------|--------------------------|
| 3 | 30,269 Sheckles, ~8 plots |
| 5 | 275,224 Sheckles, ~26 plots |
| 7 | 1,844,082 Sheckles, ~43 plots |
| 10 | 4,252,300 Sheckles, ~55 plots |
| 15 | 100,326,180 Sheckles, ~63 plots |
| 30 | 983,672,704 Sheckles, ~63 plots |

If you're behind a checkpoint: you're under-expanded or under-mutating. Buy more
plots and keep them **all** full, and prioritize weather events for mutations.

## Verify the route

```bash
node play.js     # replays the full strategy; prints the day it crosses 1,000,000
npm test         # confirms the engine + playthrough still reach the target
```

Verified result: **983,672,704 Sheckles by day 30** (crossed 1,000,000 on day 7).
