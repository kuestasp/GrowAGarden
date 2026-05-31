// Grow a Garden — planning engine (framework-agnostic).
// Works in the browser (attaches to window.GAG) and in Node (module.exports).
//
// The model in one paragraph: your garden has a fixed number of plots. Each plot
// grows one plant, which yields (sell * mutationMultiplier) Sheckles per harvest
// across `harvests` harvests over its lifecycle, then you replant. Steady-state
// income is therefore plots * (revenue per plant / lifecycle length). You buy
// seeds out of income; expanding plots and chasing mutations are the two levers
// that bend the curve from linear to exponential. The simulator below plays this
// out day by day so the "1,000,000 in 30 days" target stops being a vibe and
// becomes a number you can check.

(function (root) {
  "use strict";

  const HOURS_PER_DAY = 24;

  // Effective sell price for one fruit given mutation choices.
  function fruitValue(baseSell, growthMult = 1, envMults = []) {
    return envMults.reduce((v, m) => v * m, baseSell * growthMult);
  }

  // Lifecycle length of one plant, in hours, from plant to final harvest.
  function lifecycleHours(crop) {
    const extra = Math.max(0, crop.harvests - 1) * (crop.reHrs || 0);
    return crop.growHrs + extra;
  }

  // Revenue a single plant returns over its whole lifecycle.
  function revenuePerPlant(crop, valuePerFruit) {
    return valuePerFruit * crop.harvests;
  }

  // Steady-state profit per plot per in-game day for a crop, net of seed cost.
  // `mutationFraction` is the share of fruit that carry the assumed mutation set
  // (0..1); the rest sell at base value.
  function profitPerPlotPerDay(crop, opts = {}) {
    const growthMult = opts.growthMult ?? 1;
    const envMults = opts.envMults ?? [];
    const mutationFraction = clamp(opts.mutationFraction ?? 0, 0, 1);

    const mutatedValue = fruitValue(crop.sell, growthMult, envMults);
    const blendedValue =
      mutatedValue * mutationFraction + crop.sell * (1 - mutationFraction);

    const lifeHrs = lifecycleHours(crop);
    const lifeDays = lifeHrs / HOURS_PER_DAY;

    const revenue = revenuePerPlant(crop, blendedValue);
    const profit = revenue - crop.seed; // seed paid once per lifecycle per plot
    return profit / lifeDays;
  }

  // Rank crops by profit/plot/day, optionally filtered to what `budget` can seed
  // across `plots` slots (you must afford to fill the garden to use a crop well).
  function rankCrops(crops, opts = {}) {
    const plots = opts.plots ?? 1;
    const budget = opts.budget ?? Infinity;
    return crops
      .map((crop) => ({
        crop,
        perPlotPerDay: profitPerPlotPerDay(crop, opts),
        seedToFill: crop.seed * plots,
        affordable: crop.seed * plots <= budget,
      }))
      .sort((a, b) => b.perPlotPerDay - a.perPlotPerDay);
  }

  // Day-by-day simulation toward a target.
  // config: {
  //   startBalance, plots, target, days,
  //   crop, growthMult, envMults, mutationFraction,
  //   plotCost,            // Sheckles to buy one more plot (0 = no expansion)
  //   plotCostGrowth,      // each new plot costs this much more (multiplier)
  //   reinvestPlots,       // true = spend surplus on plots before banking
  //   reinvestRate,        // fraction of balance to plow into plots each day (0..1)
  // }
  function simulate(config) {
    const days = config.days ?? 30;
    const target = config.target ?? 1_000_000;
    const crop = config.crop;
    let balance = config.startBalance ?? 0;
    let plots = config.plots ?? 8;
    let plotCost = config.plotCost ?? 0;
    const plotCostGrowth = config.plotCostGrowth ?? 1.15;
    const reinvestPlots = config.reinvestPlots ?? true;
    const reinvestRate = clamp(config.reinvestRate ?? 0.7, 0, 1);

    const perPlotPerDay = profitPerPlotPerDay(crop, config);
    const trajectory = [];
    let hitDay = null;

    for (let day = 1; day <= days; day++) {
      const income = plots * perPlotPerDay;
      balance += income;

      let plotsBought = 0;
      if (reinvestPlots && plotCost > 0) {
        // Plow a fixed share of the current bank into expansion, keeping the
        // rest as a reserve. Escalating plot cost keeps this from running away.
        let budgetForPlots = balance * reinvestRate;
        while (budgetForPlots >= plotCost && balance >= plotCost) {
          balance -= plotCost;
          budgetForPlots -= plotCost;
          plots += 1;
          plotsBought += 1;
          plotCost *= plotCostGrowth;
        }
      }

      trajectory.push({
        day,
        income: Math.round(income),
        plots,
        plotsBought,
        balance: Math.round(balance),
      });

      if (hitDay === null && balance >= target) hitDay = day;
    }

    return {
      crop: crop.name,
      perPlotPerDay,
      hitDay,
      finalBalance: Math.round(balance),
      finalPlots: plots,
      trajectory,
      success: hitDay !== null,
    };
  }

  // Given a fixed daily income, the constant-rate days to reach target.
  function daysAtConstantRate(startBalance, dailyIncome, target) {
    if (dailyIncome <= 0) return Infinity;
    return Math.max(0, (target - startBalance) / dailyIncome);
  }

  // What does it take? Returns the cheapest crop whose plot-filled income
  // reaches the target within `days`, plus the plots required for each crop.
  function solveForTarget(crops, opts = {}) {
    const days = opts.days ?? 30;
    const target = opts.target ?? 1_000_000;
    const startBalance = opts.startBalance ?? 0;
    const need = target - startBalance;

    return crops
      .map((crop) => {
        const perPlotPerDay = profitPerPlotPerDay(crop, opts);
        const plotsNeeded =
          perPlotPerDay > 0 ? Math.ceil(need / (perPlotPerDay * days)) : Infinity;
        return {
          crop,
          perPlotPerDay,
          plotsNeeded,
          seedCapital: isFinite(plotsNeeded) ? plotsNeeded * crop.seed : Infinity,
        };
      })
      .filter((r) => isFinite(r.plotsNeeded))
      .sort((a, b) => a.seedCapital - b.seedCapital);
  }

  function clamp(x, lo, hi) {
    return Math.max(lo, Math.min(hi, x));
  }

  const GAG = {
    HOURS_PER_DAY,
    fruitValue,
    lifecycleHours,
    revenuePerPlant,
    profitPerPlotPerDay,
    rankCrops,
    simulate,
    daysAtConstantRate,
    solveForTarget,
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = GAG;
  } else {
    root.GAG = GAG;
  }
})(typeof window !== "undefined" ? window : globalThis);
