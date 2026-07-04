# Nutrition Optimizer — Vegan Food Planner

A web app that computes the **cheapest vegan diet that satisfies the official Japanese dietary reference intakes**, and lets you **compare foods as a partial order** over nutrition and cost — where "cost" is not just money, but also CO₂e emissions, land use, and water use.

Live site: https://nwatab.github.io/nutrition-optimizer/

## What it does

- **Personalized nutrition targets.** From sex, age band, body weight, physical activity level, and (for women) menstruation status, the app derives daily targets — estimated energy requirement, protein RDA, macronutrient energy ratios, and min/max constraints for vitamins and minerals — following the Dietary Reference Intakes for Japanese (2025).
- **Diet optimization by linear programming.** Given those targets as constraints, an LP solver ([YALPS](https://github.com/Ivordir/YALPS)) minimizes total food cost in yen over a catalog of vegan foods and returns a purchase plan: how many grams of each food, its cost, and the resulting nutrition totals. Prices are normalized to **edible portion per 100 g** using each food's refuse rate, so high-waste foods (vegetables, fruits) are not systematically underpriced.
- **Diagnosis and shadow prices.** The result is diagnosed nutrient by nutrient (deficient / ok / excess), and shadow prices (yen per unit of each binding nutrient constraint) are estimated by perturbing the LP, showing which nutrients drive the cost of your diet.
- **Food comparison as a partial order (skyline / Hasse diagram).** Food *x* dominates food *y* iff *x* has higher nutrient density on every selected nutrient axis **and** lower cost on every cost axis (yen, kg-CO₂e, m² of land, L of water), with at least one strict inequality. The app computes the Pareto front (skyline) and the covering relation for a Hasse diagram; incomparable pairs (e.g. organic vs. conventional) stay incomparable. An optional scalarization (user-chosen prices for CO₂e/land/water) collapses the partial order into a single ranking. Nutrient density can be measured per 100 g, per kcal, or per yen.
- **Bilingual UI** (English / Japanese) with static export.

## Data sources

All nutrition and price inputs come from official Japanese government data. The table below states **what is derived** from **which dataset** (original Japanese names included).

| What we derive | Dataset (English) | Dataset (Japanese original) | Publisher | Files in repo |
|---|---|---|---|---|
| Nutrient content per 100 g edible portion; refuse rates (廃棄率); fatty acid detail | Standard Tables of Food Composition in Japan — 2023 (Eighth Revised Edition), main table and fatty acids volume | 日本食品標準成分表（八訂）増補2023年（本表・脂肪酸成分表編） | Ministry of Education, Culture, Sports, Science and Technology (文部科学省, MEXT) | `public_data/20230428-mxt_kagsei-mext_00001_012.xlsx`, `..._032.xlsx` |
| Retail food prices (average of the latest 3 months per item) | Retail Price Survey (Trend Survey) — retail prices of major items by city / in the Tokyo ward area | 小売物価統計調査（動向編）「主要品目の都市別小売価格」「主要品目の東京都区部小売価格」 | Statistics Bureau, Ministry of Internal Affairs and Communications (総務省統計局), distributed via e-Stat (政府統計の総合窓口) | `public_data/b002-1.xlsx`, `public_data/b002-2.xlsx` |
| Daily nutrition targets: energy (EER), protein RDA, macro energy ratios, vitamin/mineral RDAs and tolerable upper limits | Dietary Reference Intakes for Japanese (2025) — study group report | 「日本人の食事摂取基準（2025年版）」策定検討会報告書 | Ministry of Health, Labour and Welfare (厚生労働省, MHLW) | transcribed coefficients in `src/data/dri-2025.ts` (source tables cited inline) |
| Environmental cost per kg of food: greenhouse gas emissions (kg-CO₂e), land use (m²), freshwater withdrawals (L) | Poore & Nemecek (2018), *Reducing food's environmental impacts through producers and consumers*, Science 360(6392) — global mean values as compiled by Our World in Data | — | Science / Our World in Data | `src/data/environmental-impact-reference.ts` |

Additional notes:

- The mapping between e-Stat price items (`estatId`) and food composition table entries (食品番号, *shokuhinbangou*) is maintained by hand in `src/data/cross-food-data-reference.ts`.
- A few bulk foods not covered by the Retail Price Survey (e.g. soybeans, chickpeas, hemp protein) use manually recorded prices from online retailers, with source URLs kept in `src/data/manual-price-food-data-reference.ts` and `src/data/manual-food-product-reference.ts`.
- Environmental figures are **global means**; origin (domestic vs. imported) and production-method differences are not corrected for. Categories missing from Poore & Nemecek (mushrooms, seaweed, etc.) are rough approximations, flagged as such in the source file.

## Getting started

Requires [pnpm](https://pnpm.io/).

```bash
pnpm install
pnpm dev        # start dev server at http://localhost:3000
pnpm test       # run unit tests (vitest)
pnpm lint       # lint
pnpm build      # static export to out/
```

## Project structure

```
public_data/          # source xlsx files (MEXT food composition, e-Stat prices)
src/
  app/[locale]/       # Next.js App Router pages (top, foods, compare, recommendations)
  components/         # UI components (charts, tables, comparison views)
  data/               # transcribed reference data: DRI 2025, env impact, id mappings
  services/           # pure logic: xlsx parsing, LP optimizer, diagnosis,
                      # shadow prices, nutrient density, domination/skyline/Hasse
  locales/            # en-US / ja-JP messages
```

The `services/` layer is deliberately framework-free and written as pure functions with unit tests — a good entry point for contributions.

## Updating the price data

Prices come from monthly e-Stat releases, and the download URLs change every month (the `statInfId` query parameter is not stable):

1. Open the e-Stat dataset list linked in the header comment of `src/data/cross-food-data-reference.ts` and navigate to the latest month.
2. Download Table 2-1 (fresh foods) as `public_data/b002-1.xlsx` and Table 2-2 (other items) as `public_data/b002-2.xlsx`.
3. Run `pnpm test`; if the layout is unchanged, refresh snapshots with `pnpm vitest run -u` and review the diff.

The food composition tables (`20230428-mxt_kagsei-mext_00001_*.xlsx`) are the 2023 MEXT release and rarely change; the file names are the original MEXT publication file names.

## Contributing

Contributions are welcome — bug reports, new foods for the catalog, better data mappings, UI improvements, and algorithmic ideas alike. To contribute:

1. Fork the repository and create a feature branch.
2. Keep the `services/` layer pure and covered by vitest tests (`pnpm test`).
3. When adding foods, cite the data source (e-Stat item id, 食品番号, or a retailer URL) in the corresponding file under `src/data/`.
4. Open a pull request with a short description of what and why.

If you are unsure whether an idea fits, open an issue first and let's discuss.

## License

[MIT](LICENSE)

## Deploy on GitHub Pages

Pushing to `main` triggers the [Deploy to GitHub Pages](.github/workflows/deploy.yml) workflow, which builds the static export (`next build` with `output: 'export'`) and publishes the `out/` directory to GitHub Pages.

The site is served under the `/nutrition-optimizer` base path. The workflow sets `NEXT_PUBLIC_BASE_PATH=/nutrition-optimizer` at build time; local `pnpm dev` and `pnpm build` are unaffected and serve from the root.

One-time setup: in the repository settings, set **Settings → Pages → Source** to **GitHub Actions**.

## Disclaimer

This tool is for educational and planning purposes. It is not medical or dietary advice; consult a qualified professional for individual health decisions.
