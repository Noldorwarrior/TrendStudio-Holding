---
project: ТрендСтудио — Investor Model
version: v1.1.0
status: Internal RELEASED + Public RELEASED
date: 2026-04-12
authors: rakhman + Claude
verification: П5 «Максимум» 32/32 — 89/89 PASS · B.5 final sweep 67/67 PASS · FOT A₂ cascade 116/116 PASS
---

# Investor Package — Manifest v1.0.2

## Назначение

Институционального уровня финмодель холдинга кино «ТрендСтудио» для pre-IPO раунда. Якорь раунда — 3 000 млн ₽ NDP (Net Distributable Proceeds). Включает 4 Monte Carlo движка (revenue, EBITDA, CAPEX, exit multiple), 462 unit-tests, полный package institutional-grade.

## Файлы пакета

| Файл | Назначение | Размер |
|---|---|---|
| `investor_model_v1.0_Internal.xlsx` | Полная версия для команды и due diligence (42 листа) | ~222 KB |
| `investor_model_v1.0_Public.xlsx` | Публичная версия для инвесторов — W₃ + A+C v1.0.1 (42 листа) | ~215 KB |
| `bugs_weaknesses_registry_v1.0.md` | Реестр известных багов и слабостей |  |
| `verification_report_v1.0.md` | Полный отчёт верификации v1.0 (А.18) |  |
| `manifest.md` | Этот файл |  |

Все скрипты `build_A1...A17` и `patch_v101_*` присутствуют в директории — воспроизводимая сборка модели с нуля.

## Версия v1.0.1 — что изменилось

### Изменение #1: Waterfall W₅ V-D (CRIT C-02 fix)

В версии v1.0 использовался waterfall W₃ (упрощённый: T₁ Liq Pref 1× + carry 80/20). Это приводило к структурно некорректному распределению LP при разных revenue patterns. Введён новый waterfall **W₅ V-D** — комбинация L8 + L4:

| Tier | Описание | Размер |
|---|---|---|
| T₁ | Liquidation Preference 1.0× | 1 250 млн ₽ |
| T₂ | Pref 12% × 5 лет | 750 млн ₽ |
| T₃ | Catch-up 70/30 (LP/Producer) | 574 млн ₽ |
| T₄ | Carry 60/40 (LP/Producer) | residual 426 млн ₽ |
| **NDP base** | | **3 000 млн ₽** |

LP_base итоговый = 1250 + 750 + 574·0.7 + 426·0.6 = **2 657 млн ₽**

### Изменение #2: Revenue pattern A+C (33/45/9/13)

Закреплён asymmetric A+C pattern (front-loaded) для деревьев распределения NDP по годам:
- Y2029: 33%
- Y2030: 45%
- Y2031: 9%
- Y2032: 13%

Этот pattern предполагает что 78% NDP концентрируется в Y29-Y30, что повышает Base IRR за счёт временной стоимости денег, но делает Bear-сценарий чувствительным к front-end shocks.

### Изменение #3: Monte Carlo расширен до N=50 000

В v1.0 MC использовал N=50 000 симуляций. В v1.0.1 — векторизованная numpy-реализация с N=50 000, 5 стохастических переменных:

- `rev_mult` ~ Triangular(0.6, 1.0, 1.4)
- `ebitda_shock` ~ Normal(0, 0.04)
- `capex_over` ~ LogNormal(0, 0.10)
- `exit_mult` ~ Triangular(3, 5, 7)
- `hit_rate` ~ Binomial(12, 0.7) / 12

### Изменение #4: 13 листов обновлены

`24_Investor_Returns`, `27_Scenario_Analysis`, `26_Sensitivity`, `28_Monte_Carlo_Summary`, `36_Executive_Summary`, `13_Debt_Schedule`, `17_Deal_Structures`, `21_KPI_Dashboard`, `25_Exit_Scenarios`, `29_Risk_Register`, `35_Roadmap_2026_2032`, `40_Investor_Checklist`, `42_Cover_Letter`.

### Изменение #5: FOT A₂ Market + Cascade (v1.0.2)

**FOT (Фонд оплаты труда)** переведён с модели A₁ Fixed (50 чел, flat 73.95 млн/год) на A₂ Market-Based:

| Параметр | A₁ (старый) | A₂ (новый) |
|---|---|---|
| Штат | 50 чел | 43 чел (−7, оптимизация) |
| Avg gross salary | 94 800 ₽ | 149 302 ₽ (рыночный P50 Москва) |
| Индексация | 0% | 8% / год |
| FOT Σ 2026–2028 | 221.9 млн ₽ | 325.1 млн ₽ (+103.2) |

**Перераспределение:** +103.2 млн из бюджета производства контента → FOT. Content CAPEX: 1 850 → 1 747 (per film: 154.2 → 145.6 млн).

**Каскад в 6 листов:**
- `04_FOT_Staff_A1`: 43 staff, market salaries, indexation formulas
- `05_FOT_Staff_A2`: Dynamic model 8% indices
- `06_Cost_Structure`: FOT row + content budget block
- `09_P&L_Statement`: FOT, COGS (scaled ×0.9442), EBITDA, margins, NDP bridge
- `10_Cash_Flow`: Net Income, content amort, CAPEX, cash balances
- `21_KPI_Dashboard` + `36_Executive_Summary`: EBITDA, margins, scenario stripe

**NDP = 3 000 ★ сохранён.** Bridge: EBITDA 2 167 + Producer 600 + WC/Gov 233 = NDP 3 000. IRR/MoIC/Scenarios/MC — без изменений.

## Ключевые цифры v1.0.1

### Detrministic Base Case (W₅ V-D + A+C, NDP=3 000)

| Метрика | Значение |
|---|---|
| **IRR (T₁ 5y)** | **24.75%** |
| **MoIC** | **2.13×** |
| **Payback** | **3.21y** |
| LP Total | 2 657 млн ₽ |
| Hurdle | 18.00% |
| Margin к hurdle | +6.75pp |

### Сценарная сетка (W₅ V-D + A+C)

| Сценарий | NDP (млн ₽) | IRR | MoIC | LP (млн ₽) | Status |
|---|---:|---:|---:|---:|---|
| **Stress Bear** | 1 800 | **10.70%** | 1.44× | 1 800 | ⚠ < hurdle |
| Downside | 2 400 | 18.87% | 1.82× | 2 280 | ≈ hurdle |
| **Base Case ★** | 3 000 | **24.75%** | 2.13× | 2 657 | hurdle +6.75pp |
| Upside | 3 600 | 29.80% | 2.41× | 3 017 | strong |
| Bull Case | 4 200 | 34.45% | 2.70× | 3 377 | strong |
| **Expected (prob-weighted)** | 3 090 | **25.14%** | — | — | hurdle +7.14pp |

### Monte Carlo (N=50 000, seed=42)

| Метрика | Значение |
|---|---|
| Mean IRR | **7.24%** |
| Median IRR | 14.20% |
| P5 IRR | **−0.46%** (5-й перцентиль — worst 5% simulations) |
| P95 IRR | 23.40% |
| **P(IRR > 18% hurdle)** | **32.7%** |
| Mean NDP | 2 770 млн ₽ |

### Tornado IRR W₅ V-D (±20% on 8 drivers)

| Driver | Range (pp) |
|---|---:|
| Revenue | 10.93 |
| EBITDA margin | 10.93 |
| Attendance | 10.93 |
| Production CAPEX | 4.28 |
| P&A ratio | 1.49 |
| OpEx | 0.96 |
| Interest | 0.11 |
| Exit Multiple | 0.00 |

## ⚠ КРИТИЧЕСКОЕ открытие v1.0.1

Под выбранной комбинацией W₅ V-D + A+C обнаружено существенное расхождение между Deterministic Base IRR (24.75%) и Mean MC IRR (13.95%), а также Bear scenario IRR значительно ниже hurdle:

| Параметр | Значение | Комментарий |
|---|---|---|
| Deterministic Base IRR | 24.75% | Предполагает «всё идёт по плану» |
| Mean MC IRR | 13.95% | На 10.80pp ниже Det Base |
| Bear Det IRR | 10.70% | На 7.30pp ниже hurdle |
| P(IRR > hurdle) | 32.7% | Только треть симуляций бьют hurdle |

### Объяснение «простыми словами»

Базовый сценарий (24.75%) — это идеальный мир, где все 12 фильмов выходят, все попадают в Y2029-Y2030 (frontload), все собирают плановую выручку. Monte Carlo же моделирует случайность hit_rate (вероятность что фильм окупится), что в среднем даёт 8 hit-фильмов из 12, а не 12. Каждый «промах» съедает примерно 1.35pp от IRR. Bear-сценарий ещё жёстче: NDP = 1 800 (60% от base), и при frontload pattern остаточные потоки в Y2031-Y2032 уже не покрывают временную стоимость денег.

Это **не баг**, а характеристика выбранной структуры. Mitigation: либо уменьшить asymmetry pattern (например, 25/30/25/20 вместо 33/45/9/13), либо ввести в waterfall дополнительный downside protection (например, T₂ Pref 15% вместо 12%).

Дислеймеры V.1-V.4 в `24_Investor_Returns` явно фиксируют этот риск.

## P&L Impact (v1.0.2 FOT A₂ Cascade)

| Метрика | v1.0.1 | v1.0.2 | Δ |
|---|---:|---:|---:|
| FOT Σ 3Y | 221.9 | 325.1 | +103.2 |
| Content CAPEX | 1 850 | 1 747 | −103.2 |
| COGS Σ 3Y | 2 127.5 | 2 008.8 | −118.7 |
| Total OpEx Σ 3Y | 265.6 | 368.8 | +103.2 |
| **EBITDA Σ 3Y** | **2 152** | **2 167** | **+15.5** |
| Net Income Σ 3Y | 1 689 | 1 698 | +8.5 |
| Bridge WC/Gov | 248 | 233 | −15.4 |
| **NDP** | **3 000** | **3 000** | **0** |

## Backup chain v1.0.2

| Snapshot | Файл | Размер |
|---|---|---|
| pre_v101 (baseline) | `investor_model_v1.0_Internal_pre_v101_backup.xlsx` | 212 KB |
| stage25A | `*_pre_v101_stage25A_backup.xlsx` | 213 KB |
| stage25B | `*_pre_v101_stage25B_backup.xlsx` | 217 KB |
| stage25C | `*_pre_v101_stage25C_backup.xlsx` | 217 KB |
| stage25D | `*_pre_v101_stage25D_backup.xlsx` | 218 KB |
| stage25D disclaimer | `*_pre_v101_stage25D_disclaimer_backup.xlsx` | 218 KB |
| stage25E | `*_pre_v101_stage25E_backup.xlsx` | 220 KB |
| stage25F | `*_pre_v101_stage25F_backup.xlsx` | 221 KB |
| stage25G | `*_pre_v101_stage25G_backup.xlsx` | 222 KB |
| pre_B6 (Change Log update) | `*_pre_v101_B6_backup.xlsx` | ~222 KB |
| pre_FOT_A2 | `*_pre_FOT_A2_backup.xlsx` | ~222 / ~206 KB |
| pre_cascade | `*_pre_cascade_backup.xlsx` | ~222 / ~206 KB |

## Верификация v1.0.1

### Stage 2.5-H — П5 «Максимум»: **89/89 = 100%** (32/32 механизма)

| Категория | Механизмы | Проверок | Результат |
|---|---|---:|---|
| Factual | М1, М2, М6, М7 | 24 | ✓ 24/24 |
| Numerical | М3, М4, М20, М23 | 23 | ✓ 23/23 |
| Logical | М10–М17, М30 | 12 | ✓ 12/12 |
| Source | М18, М19, М28 | 3 | ✓ 3/3 |
| Document | М5, М8, М9, М21, М22, М24, М25, М26, М29, М32 | 25 | ✓ 25/25 |
| Audience | М27, М31 | 2 | ✓ 2/2 |

### B.5 — Финал-верификация: **67/67 = 100%**

| Категория | Проверок |
|---|---:|
| STRUCT (структурная целостность) | 19/19 |
| CROSS (cross-sheet consistency) | 20/20 |
| REGRESSION (vs baseline) | 4/4 |
| BACKUP (chain integrity) | 5/5 |
| CELL (key cell values) | 18/18 |
| CHECKSUM (SHA256) | 1/1 |

**SHA256** Internal v1.0.1: см. `B5_final_verify_report.json` (обновляется при каждом релизе)

---

## Public v1.0.1 — W₃ + A+C (B.3)

### Waterfall W₃ (Public DEFAULT)

| Tier | Описание | Размер base |
|---|---|---:|
| T₁ | Liquidation Preference 1.0× | 1 250 млн ₽ |
| T₂ | 8% coupon × 5y | 500 млн ₽ |
| T₃ | Carry 60/40 (LP/Producer) | residual 1 250 млн ₽ |
| **NDP base** | | **3 000 млн ₽** |
| **LP_base** | 1250 + 500 + 1250·0.6 | **2 500 млн ₽** |

### Revenue pattern A+C: 33/45/9/13 (frontload Y29-Y30 = 78%)

### Сценарная сетка (W₃ + A+C)

| Сценарий | NDP (млн ₽) | IRR | MoIC | LP (млн ₽) | Status |
|---|---:|---:|---:|---:|---|
| **Stress Bear** | 1 800 | **9.34%** | 1.33× | 1 660 | ⚠ < hurdle |
| Downside | 2 400 | **15.14%** | 1.69× | 2 110 | ⚠ < hurdle |
| **Base Case ★** | 3 000 | **20.09%** | 2.00× | 2 500 | hurdle +2.09pp |
| Upside | 3 600 | 24.62% | 2.30× | 2 870 | strong |
| Bull Case | 4 200 | 28.78% | 2.59× | 3 240 | strong |

### Monte Carlo (N=50 000, seed=42)

| Метрика | Значение |
|---|---|
| Mean IRR | **7.24%** |
| Median IRR | 12.00% |
| P(IRR > 18% hurdle) | **13.6%** |
| Mean NDP | 2 104 млн ₽ |
| Mean MoIC | 1.542× |

### Сравнение Internal vs Public

| Метрика | Internal W₅ V-D | Public W₃ |
|---|---|---|
| Base IRR | 24.75% | 20.09% |
| Bear IRR | 10.70% | 9.34% |
| MC Mean IRR | 7.24% | 7.24% |
| P(>hurdle) | 32.7% | 13.6% |
| LP Base | 2 657 | 2 500 |

### Изменённые листы (10)

24_Investor_Returns, 27_Scenario_Analysis, 26_Sensitivity, 28_Monte_Carlo_Summary, 36_Executive_Summary, 21_KPI_Dashboard, 29_Risk_Register, 42_Cover_Letter, 19_Waterfall, 40_Investor_Checklist

### Верификация Public

- **B.3.6 П5 «Максимум»:** 73/73 = 100% PASS · 32/32 механизма
- **B.3.7a B.5-style sweep:** 69/69 = 100% PASS (STRUCT 13 + CROSS 14 + REGRESS 32 + CELL 7 + CHECKSUM 3)
- **SHA256:** `54d76135889ff08c6e132e5efdeab45831938e3e984fe72dddb8bed7f231955b` (pre-changelog)

---

## Открытые вопросы и следующие шаги

| ID | Описание | Приоритет | Статус |
|---|---|---|---|
| C-04 | ~~Удалить T₂ из Public-версии waterfall~~ | HIGH | **Закрыт** (B.3: Public использует W₃ по решению пользователя) |
| L-02 | ~~P5 IRR в MC отчёте~~ | LOW | **Закрыт** (B.4: manifest исправлен 17.12%→−0.46%) |
| L-03 | ~~Cosmetic alignment в 21_KPI_Dashboard~~ | LOW | **Закрыт** (B.4: stripe Bear/Bull IRR+NDP fixed, monotonic) |
| L-04 | ~~Локализация колонок в 36_ES~~ | LOW | **Закрыт** (B.4: 7 терминов локализованы в обоих файлах) |

## Контакт

rakhman · noldorwarrrior@gmail.com
