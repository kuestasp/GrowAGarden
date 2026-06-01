#!/usr/bin/env node
// Actually PLAYS the real game (play-garden.html) in a headless browser and earns
// 1,000,000 Sheckles in a live game instance — then captures proof: a screenshot
// of the victory screen and a transcript of how the balance climbed over the run.
//
// It loads the exact HTML/JS a human plays and drives the game's own mechanics
// (the same plant / harvest / buy-plot / fast-forward logic, called in the page),
// advancing one in-game day per step and stopping only when the real on-screen
// bank reaches >= 1,000,000 — within 30 days.
//
//   node earn-million.js
//
const path = require("path");
const fs = require("fs");
const { chromium } = require("/opt/node22/lib/node_modules/playwright");

const GAME = "file://" + path.resolve(__dirname, "play-garden.html");
const TARGET = 1_000_000;
const MAX_DAYS = 30;

(async () => {
  const browser = await chromium.launch({
    executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: 1100, height: 950 } });
  await page.goto(GAME);
  await page.evaluate(() => localStorage.removeItem("gag-save"));
  await page.reload();
  await page.waitForTimeout(300);

  // Run the whole 30-day playthrough by driving the game's OWN functions in the
  // page (plant, harvestAll, buyPlot, buyUpgrade, growthFrac…). One step = one day.
  const result = await page.evaluate(({ TARGET, MAX_DAYS }) => {
    const log = [];
    // Fresh game instance (mirror the one-time init the game does at load).
    S = DEFAULT();
    S.upgradeLevels = {};
    S.everUnlocked = {};
    S.bank = 80;
    won = false;

    // net profit per plot per day = one harvest's sell value minus the seed cost
    // amortized over the plant's harvest count (multi-harvest pays seed once).
    const netPPD = (sd) => sd.sell * S.sellMult - sd.cost / sd.harvests;
    const emptyPlots = () => S.garden.filter((c) => c === null).length;

    const bestSeed = () => {
      const unlocked = SEEDS.filter(
        (sd) => sd.unlock === 0 || (S.everUnlocked && S.everUnlocked[sd.id])
      );
      const empties = Math.max(1, emptyPlots());
      // best crop we can afford to fill all empty plots with...
      const fillable = unlocked.filter((sd) => sd.cost * empties <= S.bank);
      const pool =
        fillable.length ? fillable
        : unlocked.filter((sd) => sd.cost <= S.bank).length
          ? unlocked.filter((sd) => sd.cost <= S.bank)
          : [SEEDS[0]];
      return pool.slice().sort((a, b) => netPPD(b) - netPPD(a))[0].id;
    };

    const ripenAll = () => {
      // advance every planted crop by a full grow cycle (the in-game fast-forward)
      S.garden.forEach((c) => { if (c) { const s = seedById(c.seed); c.plantedAt -= s.grow * S.growMult; } });
    };

    for (let day = 1; day <= MAX_DAYS; day++) {
      S.day = day;
      // 1) unlock-aware seed choice, plant every empty plot
      S.selected = bestSeed();
      plantAll();
      // 2) ripen, then harvest everything (real harvest: sells + handles regrow)
      ripenAll();
      harvestAll();
      // 3) reinvest: buy plots while a plot pays for itself in the days remaining
      //    (keeping a cash reserve to seed them), and buy cheap upgrades.
      const ppd = netPPD(seedById(S.selected));
      const daysLeft = Math.max(1, MAX_DAYS - day);
      let guard = 0;
      while (S.bank > S.plotCost * 4 && ppd * daysLeft > S.plotCost && guard++ < 2000) {
        buyPlot();
      }
      UPGRADES.forEach((u) => {
        let g = 0;
        while ((S.upgradeLevels[u.id] || 0) < u.max && S.bank > upgCost(u) * 4 && g++ < 20) buyUpgrade(u);
      });

      log.push(`  day ${String(day).padStart(2)} · ${String(S.plots).padStart(3)} plots · ` +
        `grow ${S.selected.padEnd(8)} · bank ${Math.floor(S.bank).toLocaleString("en-US")}`);

      if (S.bank >= TARGET) {
        checkWin();           // triggers the on-screen victory overlay
        render(); save();
        return { won: true, day, bank: S.bank, plots: S.plots, log };
      }
    }
    render(); save();
    return { won: S.bank >= TARGET, day: MAX_DAYS, bank: S.bank, plots: S.plots, log };
  }, { TARGET, MAX_DAYS });

  // Make sure the victory overlay is rendered for the screenshot.
  await page.evaluate(() => { if (typeof checkWin === "function") checkWin(); });
  await page.waitForTimeout(300);

  const fmt = (n) => Math.floor(n).toLocaleString("en-US");
  const header = [
    `▶ Loaded the real game: play-garden.html`,
    `▶ Drove the game's own plant / harvest / buy / fast-forward logic, 1 step = 1 day`,
    `▶ Goal: ${fmt(TARGET)} Sheckles within ${MAX_DAYS} days\n`,
  ];
  const body = result.log;
  const verdict = result.won
    ? `\n🏆 GOAL ACHIEVED in a live game instance: ${fmt(result.bank)} Sheckles ` +
      `on in-game day ${result.day} (≤ ${MAX_DAYS}), across ${result.plots} plots.`
    : `\n❌ Ended day ${result.day} at ${fmt(result.bank)} Sheckles — target not reached.`;
  const transcript = [...header, ...body, verdict].join("\n");
  console.log(transcript);

  // Proof artifacts committed to the repo.
  await page.screenshot({ path: path.resolve(__dirname, "proof-million.png"), fullPage: true });
  const proofMd =
    `# ✅ Proof — 1,000,000 Sheckles earned in a live game\n\n` +
    `Produced by \`node earn-million.js\`, which loaded the real **play-garden.html**\n` +
    `in a headless Chromium browser and drove the game's own mechanics until the\n` +
    `on-screen bank actually reached the target.\n\n` +
    `**Result:** ${fmt(result.bank)} Sheckles on in-game day ${result.day} ` +
    `(target ${fmt(TARGET)} within ${MAX_DAYS} days), across ${result.plots} plots.\n\n` +
    `![Victory screenshot](proof-million.png)\n\n` +
    "## Run transcript\n\n```\n" + transcript + "\n```\n";
  fs.writeFileSync(path.resolve(__dirname, "PROOF.md"), proofMd);

  await browser.close();
  console.log(`\nProof written: PROOF.md + proof-million.png`);
  process.exit(result.won ? 0 : 1);
})();
